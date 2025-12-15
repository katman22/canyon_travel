package com.wharepumanawa.canyon_travel

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

// LargeWidgetProvider.kt (only showing the key parts)

class LargeWidgetProvider : AppWidgetProvider() {
    companion object {
        const val ACTION_REFRESH = "com.wharepumanawa.canyon_travel.ACTION_REFRESH_DARK"
    }

    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { id ->
            CoroutineScope(Dispatchers.IO).launch {
                WidgetCore.updateOneWidget(
                    context = ctx,
                    appWidgetManager = mgr,
                    appWidgetId = id,
                    layoutResId = R.layout.widget_traffic_large,
                    providerClass = LargeWidgetProvider::class.java,
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
            val singleId = intent.getIntExtra(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            )
            CoroutineScope(Dispatchers.IO).launch {
                if (singleId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                    WidgetCore.updateOneWidget(
                        context = ctx,
                        appWidgetManager = mgr,
                        appWidgetId = singleId,
                        layoutResId = R.layout.widget_traffic_large,
                        providerClass = LargeWidgetProvider::class.java,
                        refreshAction = ACTION_REFRESH
                    )
                } else {
                    // fallback: refresh all instances of this provider
                    val ids = mgr.getAppWidgetIds(ComponentName(ctx, LargeWidgetProvider::class.java))
                    ids.forEach { id ->
                        WidgetCore.updateOneWidget(
                            context = ctx,
                            appWidgetManager = mgr,
                            appWidgetId = id,
                            layoutResId = R.layout.widget_traffic_large,
                            providerClass = LargeWidgetProvider::class.java,
                            refreshAction = ACTION_REFRESH
                        )
                    }
                }
            }
        }
    }
}

