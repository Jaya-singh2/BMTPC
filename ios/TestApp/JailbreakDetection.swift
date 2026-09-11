import Foundation
import UIKit
import Darwin
import React

@objc(JailbreakDetection)
class JailbreakDetection: NSObject {

    // MARK: - React Native method

    @objc
    func isJailbroken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        resolve(Self.performJailbreakCheck())
    }

    // MARK: - Native check

    static func performJailbreakCheck() -> Bool {

        #if targetEnvironment(simulator)
        return false
        #else

        // 1. Common jailbreak files / directories
        let jailbreakPaths = [
            "/Applications/Cydia.app",
            "/Applications/Sileo.app",
            "/Applications/Zebra.app",

            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/Library/MobileSubstrate",

            "/usr/sbin/sshd",
            "/usr/bin/ssh",
            "/usr/libexec/ssh-keysign",
            "/bin/bash",
            "/bin/sh",

            "/etc/apt",
            "/private/var/lib/apt",
            "/private/var/lib/cydia",
            "/private/var/stash",

            // Modern jailbreak locations
            "/var/jb",
            "/var/jb/usr/bin",
            "/var/jb/Applications",
            "/private/preboot/jb"
        ]

        for path in jailbreakPaths {
            if FileManager.default.fileExists(atPath: path) {
                return true
            }
        }

        // 2. Sandbox integrity check
        let testPath = "/private/jailbreak_test.txt"

        do {
            try "jailbreak-test".write(
                toFile: testPath,
                atomically: true,
                encoding: .utf8
            )

            try? FileManager.default.removeItem(atPath: testPath)

            // A normal iOS application should NOT be able
            // to write to /private.
            return true

        } catch {
            // Expected on a normal device.
        }

        // 3. Suspicious URL schemes
        let suspiciousSchemes = [
            "cydia://",
            "sileo://",
            "zbra://"
        ]

        for scheme in suspiciousSchemes {

            guard let url = URL(string: scheme) else {
                continue
            }

            if UIApplication.shared.canOpenURL(url) {
                return true
            }
        }

        // 4. Suspicious dynamic libraries
        let suspiciousLibraries = [
            "MobileSubstrate",
            "Substrate",
            "SubstrateLoader",
            "Substitute",
            "libhooker",
            "ElleKit",
            "FridaGadget",
            "frida",
            "TweakInject"
        ]

        for i in 0..<_dyld_image_count() {

            guard let imageNamePointer = _dyld_get_image_name(i) else {
                continue
            }

            let imageName = String(cString: imageNamePointer)

            for library in suspiciousLibraries {

                if imageName.localizedCaseInsensitiveContains(library) {
                    return true
                }
            }
        }

        // 5. Suspicious symbolic links
        let suspiciousLinkPaths = [
            "/Applications",
            "/Library/Ringtones",
            "/Library/Wallpaper",
            "/usr/arm-apple-darwin9"
        ]

        for path in suspiciousLinkPaths {

            do {
                let attributes =
                    try FileManager.default.attributesOfItem(atPath: path)

                if let type =
                    attributes[.type] as? FileAttributeType,
                   type == .typeSymbolicLink {

                    return true
                }

            } catch {
                continue
            }
        }

        return false

        #endif
    }
}