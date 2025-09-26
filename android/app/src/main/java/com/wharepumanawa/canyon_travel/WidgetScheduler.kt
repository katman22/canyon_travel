// WidgetScheduler.kt
package com.wharepumanawa.canyon_travel

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import androidx.work.*

object WidgetScheduler {
    private const val UNIQUE_NAME = "canyon_widget_refresh"

    /** Call this from providers’ onEnabled/onDisabled to keep things in sync */
    fun updateScheduling(context: Context) {
        if (hasAnyWidgets(context)) {
            schedule(context)
        } else {
            cancel(context)
        }
    }

    fun schedule(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            //.setRequiresBatteryNotLow(true)      // optional
            //.setRequiresDeviceIdle(false)        // optional
            .build()

        val work = PeriodicWorkRequestBuilder<WidgetRefreshWorker>(
            java.time.Duration.ofMinutes(30)       // WorkManager min ≈ 15m
        )
            .setConstraints(constraints)
            //.setBackoffCriteria(BackoffPolicy.EXPONENTIAL, java.time.Duration.ofMinutes(5))
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UNIQUE_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            work
        )
    }

    /** Handy for a one-time kick right after first widget is added or after boot */
    fun scheduleImmediate(context: Context) {
        val oneShot = OneTimeWorkRequestBuilder<WidgetRefreshWorker>().build()
        WorkManager.getInstance(context).enqueue(oneShot)
    }

    fun cancel(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(UNIQUE_NAME)
    }

    /** True if *any* of our widget providers have instances on the home screen */
    private fun hasAnyWidgets(context: Context): Boolean {
        val mgr = AppWidgetManager.getInstance(context)
        val anyDark = mgr.getAppWidgetIds(
            ComponentName(context, LargeWidgetProvider::class.java)
        ).isNotEmpty()
        val anyLight = mgr.getAppWidgetIds(
            ComponentName(context, LargeLightWidgetProvider::class.java)
        ).isNotEmpty()
        return anyDark || anyLight
    }
}
