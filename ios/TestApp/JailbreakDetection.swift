import Foundation
import UIKit
import Darwin
import MachO
import React

@objc(JailbreakDetection)
final class JailbreakDetection: NSObject {

    @objc
    func isJailbroken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        resolve(
            NativeSecurityManager.performJailbreakChecks()
        )
    }
}