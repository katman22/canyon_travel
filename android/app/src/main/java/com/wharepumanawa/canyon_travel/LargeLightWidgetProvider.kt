package com.wharepumanawa.canyon_travel

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import android.widget.Toast
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LargeLightWidgetProvider : AppWidgetProvider() {

    private val apiUrl = "https://pumanawa-kam.onrender.com/api/v1/canyon_times/times"
    private val bearerToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJtb2JpbGUiLCJleHAiOjIwNjIyODY1MzZ9.SeN6BWPJtm-_dADD37jqFKWoVkgjq_bnwbDWza-JEdc"

    companion object {
        const val ACTION_REFRESH = "com.wharepumanawa.canyon_travel.ACTION_REFRESH"
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            setupWidgetUI(context, appWidgetManager, appWidgetId)
            updateWidgetData(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, LargeLightWidgetProvider::class.java))
            for (id in ids) {
                updateWidgetData(context, manager, id)
            }
        }
    }

    private fun setupWidgetUI(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_light_traffic_large)

        val refreshIntent = Intent(context, LargeLightWidgetProvider::class.java).apply {
            action = ACTION_REFRESH
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context, 0, refreshIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)

        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val launchPendingIntent = PendingIntent.getActivity(
            context, 1, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        views.setOnClickPendingIntent(R.id.widget_root, launchPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun updateWidgetData(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.widget_light_traffic_large)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val connection = URL(apiUrl).openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.setRequestProperty("Authorization", bearerToken)
                val response = connection.inputStream.bufferedReader().readText()
                val data = parseData(JSONObject(response))

                withContext(Dispatchers.Main) {
                    views.setTextViewText(R.id.resort_name, data.resort)
                    views.setTextViewText(R.id.to_resort, data.toResort.toString())
                    views.setTextViewText(R.id.from_resort, data.fromResort.toString())
                    views.setTextViewText(R.id.traffic, data.traffic)
                    views.setTextViewText(R.id.parking, data.parking)
                    views.setTextViewText(R.id.weather, data.weather)

                    appWidgetManager.updateAppWidget(appWidgetId, views)

                    Toast.makeText(context, "Widget updated", Toast.LENGTH_SHORT).show()
                    Log.d("CanyonWidget", "Widget updated with data: $data")
                }

            } catch (e: Exception) {
                Log.e("CanyonWidget", "Error updating widget", e)
            }
        }
    }

    private fun parseData(json: JSONObject): LargeData {
        return LargeData(
            resort = json.getString("resort"),
            toResort = json.getInt("to_resort"),
            fromResort = json.getInt("from_resort"),
            parking = json.getString("parking"),
            updatedAt = json.getString("updated_at"),
            traffic = json.getString("traffic"),
            weather = json.getString("weather")
        )
    }

    data class LargeData(
        val resort: String,
        val toResort: Int,
        val fromResort: Int,
        val parking: String,
        val updatedAt: String,
        val traffic: String,
        val weather: String
    )
}
