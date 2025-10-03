package com.wharepumanawa.canyon_travel

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED -> {
        // Re-evaluate whether any widgets exist; schedule or cancel accordingly
        WidgetScheduler.updateScheduling(context)
        // Optional: kick an immediate refresh so widgets don't look stale after boot/update
        WidgetScheduler.scheduleImmediate(context)
      }
    }
  }
}
