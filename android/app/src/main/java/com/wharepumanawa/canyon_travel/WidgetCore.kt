package com.wharepumanawa.canyon_travel

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object WidgetCore {
    const val PREFS = "MyAppPrefs"
    fun keyFor(widgetId: Int) = "WIDGET_RESORT_$widgetId"

    // Build once from BuildConfig
    private val apiUrlBase = BuildConfig.API_BASE.trimEnd('/')
    private val bearerToken = "Bearer ${BuildConfig.API_TOKEN}"

    data class CanyonData(
        val resort: String,
        val toResort: String,
        val fromResort: String
    )

    fun configPendingIntent(context: Context, widgetId: Int): PendingIntent {
        val selectorIntent = Intent(Intent.ACTION_VIEW).apply {
            data = android.net.Uri.parse("canyontravel://widget-setup?widgetId=$widgetId")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return PendingIntent.getActivity(
            context, widgetId, selectorIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    }

    fun refreshPendingIntent(
        context: Context,
        providerClass: Class<*>,
        action: String,
        widgetId: Int
    ): PendingIntent {
        val refreshIntent = Intent(context, providerClass).apply {
            this.action = action
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
        }
        return PendingIntent.getBroadcast(
            context, widgetId, refreshIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    }

    suspend fun updateOneWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        layoutResId: Int,
        providerClass: Class<*>,
        refreshAction: String
    ) {
        val views = RemoteViews(context.packageName, layoutResId)

        // click actions (root opens config; button refreshes)
        views.setOnClickPendingIntent(R.id.widget_root, configPendingIntent(context, appWidgetId))
        views.setOnClickPendingIntent(
            R.id.refresh_button,
            refreshPendingIntent(context, providerClass, refreshAction, appWidgetId)
        )

        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val selectedResort = prefs.getString(keyFor(appWidgetId), null)

        if (selectedResort.isNullOrBlank()) {
            // Prompt state
            withContext(Dispatchers.Main) {
                views.setTextViewText(R.id.resort_name, "Select a resort")
                views.setTextViewText(R.id.to_resort, "--")
                views.setTextViewText(R.id.from_resort, "--")
                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
            return
        }

        val fullUrl = "$apiUrlBase/travel_times?resort_id=$selectedResort"
        val conn = (URL(fullUrl).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 8000
            readTimeout = 8000
            setRequestProperty("Authorization", bearerToken)
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "CanyonTravelWidget/1.0")
        }

        try {
            val code = conn.responseCode
            if (code in 200..299) {
                val json = conn.inputStream.bufferedReader().use { it.readText() }
                val data = parseData(JSONObject(json))

                withContext(Dispatchers.Main) {
                    views.setTextViewText(R.id.resort_name, data.resort)
                    views.setTextViewText(R.id.to_resort, data.toResort)
                    views.setTextViewText(R.id.from_resort, data.fromResort)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
            } else {
                val err = conn.errorStream?.bufferedReader()?.use { it.readText() }
                Log.e("CanyonWidget", "HTTP $code: $fullUrl — $err")
                withContext(Dispatchers.Main) {
                    views.setTextViewText(R.id.resort_name, "Error loading")
                    views.setTextViewText(R.id.to_resort, "--")
                    views.setTextViewText(R.id.from_resort, "Tap to retry")
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
            }
        } finally {
            conn.disconnect()
        }
    }

    private fun parseData(json: JSONObject): CanyonData {
        val resort     = json.optString("resort", "—")
        val toResort   = json.optString("to_resort", "--")       // API now returns strings
        val fromResort = json.optString("from_resort", "--")
        return CanyonData(resort, toResort, fromResort)
    }

    /** Utility to refresh ALL instances of a provider */
    fun refreshAll(context: Context, providerClass: Class<*>, action: String) {
        val mgr = AppWidgetManager.getInstance(context)
        val ids = mgr.getAppWidgetIds(ComponentName(context, providerClass))
        ids.forEach { id ->
            // fire a broadcast per widget so provider.onReceive triggers update
            val i = Intent(context, providerClass).apply { this.action = action }
            context.sendBroadcast(i)
        }
    }
}
