// android/app/src/main/java/com/wharepumanawa/canyon_travel/WidgetUpdaterModule.kt
package com.wharepumanawa.canyon_travel

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetUpdaterModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WidgetUpdater"

  // (Legacy/global) Not used by per-widget flow, but safe to keep
  @ReactMethod
  fun saveResortToPrefs(resortId: String) {
    val prefs = reactContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
    prefs.edit().putString("SELECTED_RESORT", resortId).apply()
  }

  // Per-widget: save resort for one widget id
  @ReactMethod
  fun saveResortForWidget(widgetId: Int, resortId: String) {
    val prefs = reactContext.getSharedPreferences(WidgetCore.PREFS, Context.MODE_PRIVATE)
    prefs.edit().putString(WidgetCore.keyFor(widgetId), resortId).apply()

    val ctx = reactContext.applicationContext
    // Kick both provider types; whichever owns widgetId will refresh
    WidgetCore.refreshAll(ctx, LargeWidgetProvider::class.java, LargeWidgetProvider.ACTION_REFRESH)
    WidgetCore.refreshAll(ctx, LargeLightWidgetProvider::class.java, LargeLightWidgetProvider.ACTION_REFRESH)
  }

  // Refresh all widget instances (both types)
  @ReactMethod
  fun updateWidgets() {
    val ctx = reactContext.applicationContext
    WidgetCore.refreshAll(ctx, LargeWidgetProvider::class.java, LargeWidgetProvider.ACTION_REFRESH)
    WidgetCore.refreshAll(ctx, LargeLightWidgetProvider::class.java, LargeLightWidgetProvider.ACTION_REFRESH)
  }

  // Optional convenience: ping a single id (works if your providers handle the id extra)
  @ReactMethod
  fun updateWidgetById(widgetId: Int) {
    val ctx = reactContext.applicationContext
    // If your providers handle EXTRA_APPWIDGET_ID, use these:
    // WidgetCore.refreshOne(ctx, LargeWidgetProvider::class.java, LargeWidgetProvider.ACTION_REFRESH, widgetId)
    // WidgetCore.refreshOne(ctx, LargeLightWidgetProvider::class.java, LargeLightWidgetProvider.ACTION_REFRESH, widgetId)

    // Otherwise just refresh all; providers will update themselves.
    updateWidgets()
  }
}
