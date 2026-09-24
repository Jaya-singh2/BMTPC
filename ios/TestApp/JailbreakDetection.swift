import Foundation
import UIKit
import Darwin
import MachO

@objc(JailbreakDetection)
final class JailbreakDetection: NSObject {

    // MARK: - React Native bridge method
    //
    // This method is intentionally only a secondary check.
    // The primary security decision is made natively by
    // NativeSecurityManager BEFORE React Native starts.

    @objc
    func isJailbroken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        resolve(Self.performChecks())
    }

    // MARK: - Public native check

    @objc
    static func performChecks() -> Bool {
        return NativeSecurityManager.performJailbreakChecks()
    }
}