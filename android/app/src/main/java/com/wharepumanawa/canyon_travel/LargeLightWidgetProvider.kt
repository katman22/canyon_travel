package com.wharepumanawa.canyon_travel

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class LargeLightWidgetProvider : AppWidgetProvider() {
    companion object {
        const val ACTION_REFRESH = "com.wharepumanawa.canyon_travel.ACTION_REFRESH"
    }

      override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { id ->
          CoroutineScope(Dispatchers.IO).launch {
            WidgetCore.updateOneWidget(
              context = ctx,
              appWidgetManager = mgr,
              appWidgetId = id,
              layoutResId = R.layout.widget_light_traffic_large,   // ✅ use light layout here, too
              providerClass = LargeLightWidgetProvider::class.java,
              refreshAction = ACTION_REFRESH
            )
          }
        }
      }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        WidgetScheduler.updateScheduling(context)  // schedule if any exist
        WidgetScheduler.scheduleImmediate(context) // quick first refresh
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        WidgetScheduler.updateScheduling(context)  // cancel only if none remain (either provider)
    }


    override fun onReceive(ctx: Context, intent: Intent) {
        super.onReceive(ctx, intent)
        if (intent.action == ACTION_REFRESH) {
          val mgr = AppWidgetManager.getInstance(ctx)
          val oneId = intent.getIntExtra(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
          )
          CoroutineScope(Dispatchers.IO).launch {
            val ids = if (oneId != AppWidgetManager.INVALID_APPWIDGET_ID)
              intArrayOf(oneId)
            else
              mgr.getAppWidgetIds(ComponentName(ctx, LargeLightWidgetProvider::class.java))

            ids.forEach { id ->
              WidgetCore.updateOneWidget(
                context = ctx,
                appWidgetManager = mgr,
                appWidgetId = id,
                layoutResId = R.layout.widget_light_traffic_large,
                providerClass = LargeLightWidgetProvider::class.java,
                refreshAction = ACTION_REFRESH
              )
            }
          }
        }
      }
}

