import Foundation
import WidgetKit
import React

@objc(WidgetUpdater)
class WidgetUpdater: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func saveResort(_ resortId: String) {
    NSLog("[WidgetUpdater] saveResort called with id=\(resortId)")

    guard let store = UserDefaults(suiteName: Shared.appGroup) else {
      NSLog("[WidgetUpdater] ERROR: Could not open UserDefaults for app group \(Shared.appGroup)")
      return
    }

    store.set(resortId, forKey: Shared.selectedResortKey)
    NSLog("[WidgetUpdater] Stored resortId for key \(Shared.selectedResortKey)")

    WidgetCenter.shared.reloadAllTimelines()
    NSLog("[WidgetUpdater] reloadAllTimelines triggered")
  }

  @objc func reloadAll() {
    NSLog("[WidgetUpdater] reloadAll called")
    WidgetCenter.shared.reloadAllTimelines()
  }

  @objc func saveAuth(_ userId: String, jwt: String) {
      NSLog("[WidgetUpdater] saveAuth userId=\(userId)")

      guard let store = UserDefaults(suiteName: Shared.appGroup) else {
          NSLog("[WidgetUpdater] ERROR: Could not open app group store")
          return
      }

      store.set(userId, forKey: "WIDGET_USER_ID")
      store.set(jwt, forKey: "WIDGET_JWT")

      NSLog("[WidgetUpdater] Auth saved into app group")
  }

  @objc func getInstalledCount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("📊 [WidgetUpdater] getInstalledCount called")

    if #available(iOS 16.0, *) {
      WidgetCenter.shared.getCurrentConfigurations { result in
        switch result {
        case .success(let infos):
          let count = infos.filter { $0.kind == "CanyonTravellerWidget" }.count
          NSLog("[WidgetUpdater] Installed widget count = \(count)")
          resolve(count as NSNumber)

        case .failure(let err):
          NSLog("[WidgetUpdater] ERROR: getCurrentConfigurations failed: \(err.localizedDescription)")
          reject("widget_configs_failed", err.localizedDescription, err)
        }
      }
    } else {
      NSLog("[WidgetUpdater] iOS < 16: Returning count=0")
      resolve(0)
    }
  }
}
