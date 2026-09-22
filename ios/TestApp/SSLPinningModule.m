#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SSLPinningModule, NSObject)

RCT_EXTERN_METHOD(
    get:(NSString *)urlString
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    post:(NSString *)urlString
    body:(NSString *)body
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

@end