package com.wharepumanawa.canyon_travel

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle

class WidgetConfigActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val appWidgetId = intent?.getIntExtra(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            setResult(RESULT_CANCELED)
            finish()
            return
        }

        // Register for module callback
        WidgetUpdaterModule.pendingConfigActivity = this

        // Launch RN setup
        val selectorIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("canyontravel://widget-setup?widgetId=$appWidgetId")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(selectorIntent)
    }

    fun completeConfig(appWidgetId: Int) {
        val resultValue = Intent()
            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        setResult(RESULT_OK, resultValue)
        finish()
    }
}
