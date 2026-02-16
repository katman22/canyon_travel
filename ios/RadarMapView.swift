import UIKit
import CoreLocation
import MapTilerSDK

@objc(RadarMapView)
final class RadarMapView: UIView {

  private var mapView: MTMapView?
  private var didAddContours = false
  
  @objc var lat: NSNumber = 0 {
      didSet { updateCenterIfReady() }
    }

    @objc var lng: NSNumber = 0 {
      didSet { updateCenterIfReady() }
    }
  
  private var lastCenter: CLLocationCoordinate2D?
  override init(frame: CGRect) {
    super.init(frame: frame)
    setupMap()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupMap()
  }

private func setupMap() {
  let map = MTMapView(frame: bounds)
  map.autoresizingMask = [.flexibleWidth, .flexibleHeight]
  addSubview(map)
  self.mapView = map
  map.isMultipleTouchEnabled = true
  map.isUserInteractionEnabled = true

  Task { @MainActor in
    // The exact property name is SDK-version-dependent:
    // try `map.gestureService` first; if it doesn't compile, try `map.gestures`
    await map.gestureService.enablePinchRotateAndZoomGesture()
    await map.gestureService.enableTwoFingerDragPitchGesture()
    await map.gestureService.enableDoubleTapZoomInGesture()
    // If there is an enableDragPanGesture() method in your version, enable it too.
  }

  waitForStyleThenAddContours()
  updateCenterIfReady()
}
  
  private func waitForStyleThenAddContours() {
      guard let mapView else { return }
      guard !didAddContours else { return }

      if mapView.style != nil {
        addContoursLayer()
        return
      }

      // Poll briefly until style exists
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
        self?.waitForStyleThenAddContours()
      }
    }
  
  private func addContoursLayer() {
    guard let mapView, let style = mapView.style else { return }
    guard !didAddContours else { return }

    guard let contoursTilesURL = URL(
      string: "https://api.maptiler.com/tiles/contours-v2/{z}/{x}/{y}.pbf?key=TNGEDOjQUEGo58SROGRm"
    ) else { return }

    let sourceId = "contoursSource"
    let layerId  = "contoursLayer"

    // Add on main thread (MapTiler style mutations should be main-thread)
    DispatchQueue.main.async {
      // Optional: avoid duplicates if this gets called twice
      // (If your SDK has style.getSource / style.getLayer helpers, use them here)
      let source = MTVectorTileSource(identifier: sourceId, tiles: [contoursTilesURL])
      style.addSource(source)

      let layer = MTLineLayer(
        identifier: layerId,
        sourceIdentifier: sourceId,
        sourceLayer: "contour_ft"
      )
      layer.color = .brown
      layer.width = 2.0

      style.addLayer(layer)

      self.didAddContours = true
    }
  }

  
  private func updateCenterIfReady() {
    let latVal = lat.doubleValue
    let lngVal = lng.doubleValue
    guard latVal != 0, lngVal != 0 else { return }

    let center = CLLocationCoordinate2D(latitude: latVal, longitude: lngVal)

    if let last = lastCenter,
       abs(last.latitude - center.latitude) < 0.000001,
       abs(last.longitude - center.longitude) < 0.000001 {
      return
    }

    lastCenter = center

    Task {
      await applyCenter(center)
    }
  }

  
  
  @MainActor
  private func applyCenter(_ center: CLLocationCoordinate2D) async {
    await mapView?.setCenter(center)
  }


}
