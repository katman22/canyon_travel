package com.wharepumanawa.canyon_travel

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*


class WidgetUpdaterModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  companion object {
      var pendingConfigActivity: WidgetConfigActivity? = null
  }

  override fun getName(): String = "WidgetUpdater"

  init { Log.d("WidgetUpdater", "Native module constructed") }

  @ReactMethod
  fun saveResortToPrefs(resortId: String, promise: Promise) {
    try {
      Log.d("WidgetUpdater", "saveResortToPrefs($resortId)")
      val prefs = reactContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
      prefs.edit().putString("SELECTED_RESORT", resortId).apply()
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("WidgetUpdater", "saveResortToPrefs failed", e)
      promise.reject("SAVE_PREFS_ERROR", e)
    }
  }

  @ReactMethod
  fun saveResortForWidget(widgetId: Int, resortId: String, promise: Promise) {
    try {
      Log.d("WidgetUpdater", "saveResortForWidget(id=$widgetId, resort=$resortId)")
      val prefs = reactContext.getSharedPreferences(WidgetCore.PREFS, Context.MODE_PRIVATE)
      val key = WidgetCore.keyFor(widgetId)
      prefs.edit().putString(key, resortId).apply()

      // Kick refreshes
      val ctx = reactContext.applicationContext
      WidgetCore.refreshAll(ctx, LargeWidgetProvider::class.java, LargeWidgetProvider.ACTION_REFRESH)
      WidgetCore.refreshAll(ctx, LargeLightWidgetProvider::class.java, LargeLightWidgetProvider.ACTION_REFRESH)

      // Return what we saved
      val out = Arguments.createMap()
      out.putInt("widgetId", widgetId)
      out.putString("key", key)
      out.putString("resortId", resortId)
      promise.resolve(out)
    } catch (e: Exception) {
      Log.e("WidgetUpdater", "saveResortForWidget failed", e)
      promise.reject("SAVE_WIDGET_ERROR", e)
    }
  }

  @ReactMethod
  fun saveAuthForWidget(userId: String, jwt: String, promise: Promise) {
    try {
      val prefs = reactContext.getSharedPreferences("WIDGET_AUTH", Context.MODE_PRIVATE)
      prefs.edit()
        .putString("WIDGET_USER_ID", userId)
        .putString("WIDGET_JWT", jwt)
        .apply()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("SAVE_AUTH_ERROR", e)
    }
  }

  @ReactMethod
  fun getResortForWidget(widgetId: Int, promise: Promise) {
    try {
      val prefs = reactContext.getSharedPreferences(WidgetCore.PREFS, Context.MODE_PRIVATE)
      val key = WidgetCore.keyFor(widgetId)
      val value = prefs.getString(key, null)
      val out = Arguments.createMap()
      out.putInt("widgetId", widgetId)
      out.putString("key", key)
      out.putString("resortId", value)
      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("GET_WIDGET_ERROR", e)
    }
  }

  @ReactMethod
  fun updateWidgets(promise: Promise) {
    try {
      Log.d("WidgetUpdater", "updateWidgets()")
      val ctx = reactContext.applicationContext
      WidgetCore.refreshAll(ctx, LargeWidgetProvider::class.java, LargeWidgetProvider.ACTION_REFRESH)
      WidgetCore.refreshAll(ctx, LargeLightWidgetProvider::class.java, LargeLightWidgetProvider.ACTION_REFRESH)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("UPDATE_WIDGETS_ERROR", e)
    }
  }

  @ReactMethod
    fun finishWidgetConfig(appWidgetId: Int) {
        pendingConfigActivity?.let { activity ->
            activity.completeConfig(appWidgetId)
            pendingConfigActivity = null
        }
    }


  @ReactMethod
  fun updateWidgetById(widgetId: Int, promise: Promise) {
    try {
      Log.d("WidgetUpdater", "updateWidgetById($widgetId)")
      // For now just refresh all (providers fan out)
      updateWidgets(promise)
    } catch (e: Exception) {
      promise.reject("UPDATE_WIDGET_ERROR", e)
    }
  }
}
