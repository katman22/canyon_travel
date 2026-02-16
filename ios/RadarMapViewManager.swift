import Foundation
import React

@objc(RadarMapViewManager)
class RadarMapViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return RadarMapView()
  }
}
