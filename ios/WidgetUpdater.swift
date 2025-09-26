import Foundation
import WidgetKit

@objc(WidgetUpdater)
class WidgetUpdater: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func saveResort(_ resortId: String) {
    let store = UserDefaults(suiteName: Shared.appGroup)!
    store.set(resortId, forKey: Shared.selectedResortKey)
    WidgetCenter.shared.reloadAllTimelines()
  }

  @objc func reloadAll() {
    WidgetCenter.shared.reloadAllTimelines()
  }
}
