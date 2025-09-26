#import <React/RCTBridgeModule.h>
// IMPORTANT: import the generated Swift-to-ObjC header for your app target

@interface RCT_EXTERN_MODULE(WidgetUpdater, NSObject)
RCT_EXTERN_METHOD(saveResort:(NSString *)resortId)
RCT_EXTERN_METHOD(reloadAll)
@end
