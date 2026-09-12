import Foundation
import UIKit
import Darwin
import MachO
import React

@objc(JailbreakDetection)
final class JailbreakDetection: NSObject {

    // MARK: - React Native

    @objc
    func isJailbroken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        resolve(Self.performJailbreakCheck())
    }

    // MARK: - Native Jailbreak Check

    @objc
    static func performJailbreakCheck() -> Bool {

        #if targetEnvironment(simulator)
        return false
        #else

        // 1. Common jailbreak files/directories
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

            // Modern jailbreaks
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
        let testPath = "/private/jailbreak_test_\(UUID().uuidString)"

        do {
            try "jailbreak-test".write(
                toFile: testPath,
                atomically: true,
                encoding: .utf8
            )

            try? FileManager.default.removeItem(atPath: testPath)

            // Writing outside the sandbox should not be possible
            return true

        } catch {
            // Expected on a normal device.
        }

        // 3. Suspicious URL schemes
        let suspiciousSchemes = [
            "cydia://",
            "sileo://",
            "zebra://"
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

        for index in 0..<_dyld_image_count() {

            guard let imageNamePointer = _dyld_get_image_name(index) else {
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