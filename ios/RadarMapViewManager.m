#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RadarMapViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(lat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(lng, NSNumber)

@end
