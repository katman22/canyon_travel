package com.wharepumanawa.canyon_travel

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetUpdaterModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetUpdater"
    }

    @ReactMethod
    fun saveResortToPrefs(resortId: String) {
        val prefs = reactContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        prefs.edit().putString("SELECTED_RESORT", resortId).apply()
    }

    @ReactMethod
    fun updateWidgets() {
        // Optionally force widgets to update here, if needed
    }
}
