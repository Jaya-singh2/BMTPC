import Foundation
import UIKit
import Darwin
import React

@objc(JailbreakDetection)
class JailbreakDetection: NSObject {

    @objc
    func isJailbroken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {

        #if targetEnvironment(simulator)
        resolve(false)
        return
        #endif

        var detected = false

        // 1. Check common jailbreak files
        let jailbreakPaths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt",
            "/private/var/lib/apt/",
            "/private/var/stash",
            "/usr/bin/ssh",
            "/usr/libexec/ssh-keysign"
        ]

        for path in jailbreakPaths {
            if FileManager.default.fileExists(atPath: path) {
                detected = true
                break
            }
        }

        // 2. Sandbox integrity check
        if !detected {
            let testPath = "/private/jailbreak_test.txt"

            do {
                try "test".write(
                    toFile: testPath,
                    atomically: true,
                    encoding: .utf8
                )

                try? FileManager.default.removeItem(atPath: testPath)

                detected = true
            } catch {
                // Normal iOS sandbox behavior
            }
        }

        // 3. Check Cydia URL scheme
        if !detected {
            if let url = URL(string: "cydia://package/com.example.package") {
                if UIApplication.shared.canOpenURL(url) {
                    detected = true
                }
            }
        }

        // 4. Check suspicious dynamic libraries
        if !detected {
            let suspiciousLibraries = [
                "Substrate",
                "Substitute",
                "FridaGadget",
                "libhooker"
            ]

            for i in 0..<_dyld_image_count() {

                if let imageName = _dyld_get_image_name(i) {

                    let image = String(cString: imageName)

                    for library in suspiciousLibraries {
                        if image.localizedCaseInsensitiveContains(library) {
                            detected = true
                            break
                        }
                    }
                }

                if detected {
                    break
                }
            }
        }

        resolve(detected)
    }
}