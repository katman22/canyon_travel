package com.wharepumanawa.canyon_travel

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.WorkManager
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.Constraints
import androidx.work.NetworkType

class WidgetRefreshWorker(
  appContext: Context,
  params: WorkerParameters
) : CoroutineWorker(appContext, params) {

  private data class ProviderSpec(
    val clazz: Class<*>,
    val layoutResId: Int,
    val action: String
  )

  override suspend fun doWork(): Result {
    val ctx = applicationContext
    val mgr = AppWidgetManager.getInstance(ctx)

    val providers = listOf(
      ProviderSpec(
        clazz = LargeWidgetProvider::class.java,
        layoutResId = R.layout.widget_traffic_large,            // dark/primary layout
        action = LargeWidgetProvider.ACTION_REFRESH
      ),
      ProviderSpec(
        clazz = LargeLightWidgetProvider::class.java,
        layoutResId = R.layout.widget_light_traffic_large,      // ✅ light layout
        action = LargeLightWidgetProvider.ACTION_REFRESH
      )
    )

    providers.forEach { spec ->
      val ids = mgr.getAppWidgetIds(ComponentName(ctx, spec.clazz))
      ids.forEach { id ->
        WidgetCore.updateOneWidget(
          context = ctx,
          appWidgetManager = mgr,
          appWidgetId = id,
          layoutResId = spec.layoutResId,
          providerClass = spec.clazz,
          refreshAction = spec.action
        )
      }
    }

    return Result.success()
  }
}