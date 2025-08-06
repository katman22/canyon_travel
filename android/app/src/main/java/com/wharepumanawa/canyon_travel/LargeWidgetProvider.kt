package com.wharepumanawa.canyon_travel

import android.app.PendingIntent
import android.content.Intent
import android.content.BroadcastReceiver
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import kotlinx.coroutines.*
import java.net.URL
import org.json.JSONObject
import android.util.Log
import android.widget.Toast

class LargeWidgetProvider : AppWidgetProvider() {

    private val apiUrl = "https://pumanawa-kam.onrender.com/api/v1/canyon_times/times" // ← Update this!
    companion object {
            const val ACTION_REFRESH = "com.wharepumanawa.canyon_travel.ACTION_REFRESH"
        }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_traffic_large)

            // 🔁 Refresh button action
            val refreshIntent = Intent(context, LargeWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                refreshIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)

            // 🔗 Tap whole widget to open app
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val launchPendingIntent = PendingIntent.getActivity(
                context,
                1,
                launchIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            views.setOnClickPendingIntent(R.id.widget_root, launchPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)

            // 🔄 Load initial data
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }



    private fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_traffic_large)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val prefs = context.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
                val selectedResort = prefs.getString("SELECTED_RESORT", null)
                val urlString = if (selectedResort != null) {
                    "$apiUrl?resort=$selectedResort"
                } else {
                    apiUrl
                }

                val url = URL(urlString)
                val conn = url.openConnection() as java.net.HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJtb2JpbGUiLCJleHAiOjIwNjIyODY1MzZ9.SeN6BWPJtm-_dADD37jqFKWoVkgjq_bnwbDWza-JEdc")
                val jsonStr = conn.inputStream.bufferedReader().readText()
                val data = parseData(JSONObject(jsonStr))

                withContext(Dispatchers.Main) {
                    views.setTextViewText(R.id.resort_name, data.resort)
                    views.setTextViewText(R.id.to_resort, "${data.toResort}")
                    views.setTextViewText(R.id.from_resort, "${data.fromResort}")
                    views.setTextViewText(R.id.traffic, data.traffic)
                    views.setTextViewText(R.id.parking, data.parking)
                    views.setTextViewText(R.id.weather, data.weather)
                    views.setTextViewText(R.id.next_update, "last updated: ${data.updatedAt}")

                    appWidgetManager.updateAppWidget(appWidgetId, views)

                    Toast.makeText(context, "Widget updated", Toast.LENGTH_SHORT).show()
                    Log.d("CanyonWidget", "Updating views with new data: $data")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Log.e("CanyonWidget", "Widget update failed", e)
            }
        }
    }


    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, LargeWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            for (appWidgetId in appWidgetIds) {
                updateWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }


    private fun parseData(json: JSONObject): CanyonData {
        return CanyonData(
            resort = json.getString("resort"),
            toResort = json.getInt("to_resort"),
            fromResort = json.getInt("from_resort"),
            parking = json.getString("parking"),
            updatedAt = json.getString("updated_at"),
            traffic = json.getString("traffic"),
            weather = json.getString("weather")
        )
    }

    data class CanyonData(
        val resort: String,
        val toResort: Int,
        val fromResort: Int,
        val parking: String,
        val weather: String,
        val traffic: String,
        val updatedAt: String
    )

}
