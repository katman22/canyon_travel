#import <React/RCTBridgeModule.h>
// IMPORTANT: import the generated Swift-to-ObjC header for your app target

@interface RCT_EXTERN_MODULE(WidgetUpdater, NSObject)
RCT_EXTERN_METHOD(saveResort:(NSString *)resortId)
RCT_EXTERN_METHOD(reloadAll)
RCT_EXTERN_METHOD(saveAuth:(NSString *)userId jwt:(NSString *)jwt)
RCT_EXTERN_METHOD(getInstalledCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
