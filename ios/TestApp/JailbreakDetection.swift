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

    // MARK: - Main Jailbreak Check

    @objc
    static func performJailbreakCheck() -> Bool {

        #if targetEnvironment(simulator)
        return false
        #else

        // 1. Known jailbreak files/directories
        if hasJailbreakFiles() {
            return true
        }

        // 2. Sandbox integrity
        if canWriteOutsideSandbox() {
            return true
        }

        // 3. Suspicious dynamic libraries
        if hasSuspiciousDynamicLibraries() {
            return true
        }

        // 4. Suspicious URL schemes
        if hasSuspiciousURLSchemes() {
            return true
        }

        // 5. Unexpected privileges
        if hasUnexpectedPrivileges() {
            return true
        }

        // 6. Suspicious environment variables
        if hasSuspiciousEnvironment() {
            return true
        }

        return false

        #endif
    }

    // MARK: - 1. Jailbreak Files

    private static func hasJailbreakFiles() -> Bool {

        let paths = [
            "/Applications/Cydia.app",
            "/Applications/Sileo.app",
            "/Applications/Zebra.app",

            "/Library/MobileSubstrate",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",

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

        for path in paths {
            if FileManager.default.fileExists(atPath: path) {
                return true
            }
        }

        return false
    }

    // MARK: - 2. Sandbox Integrity

    private static func canWriteOutsideSandbox() -> Bool {

        let testPath =
            "/private/bmtpc_jailbreak_test_\(UUID().uuidString)"

        do {

            try "BMTPC".write(
                toFile: testPath,
                atomically: true,
                encoding: .utf8
            )

            try? FileManager.default.removeItem(
                atPath: testPath
            )

            // A normal sandboxed application
            // should not be able to do this.
            return true

        } catch {

            return false
        }
    }

    // MARK: - 3. Dynamic Libraries

    private static func hasSuspiciousDynamicLibraries() -> Bool {

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

        let imageCount = _dyld_image_count()

        for index in 0..<imageCount {

            guard let imageNamePointer =
                _dyld_get_image_name(index)
            else {
                continue
            }

            let imageName =
                String(cString: imageNamePointer)

            for library in suspiciousLibraries {

                if imageName.localizedCaseInsensitiveContains(
                    library
                ) {
                    return true
                }
            }
        }

        return false
    }

    // MARK: - 4. Suspicious URL Schemes

    private static func hasSuspiciousURLSchemes() -> Bool {

        let schemes = [
            "cydia://",
            "sileo://",
            "zebra://"
        ]

        for scheme in schemes {

            guard let url = URL(string: scheme) else {
                continue
            }

            if UIApplication.shared.canOpenURL(url) {
                return true
            }
        }

        return false
    }

    // MARK: - 5. Unexpected Privileges

    private static func hasUnexpectedPrivileges() -> Bool {

        let uid = getuid()
        let euid = geteuid()

        return uid == 0 || euid == 0
    }

    // MARK: - 6. Suspicious Environment

    private static func hasSuspiciousEnvironment() -> Bool {

        let variables = [
            "DYLD_INSERT_LIBRARIES",
            "DYLD_LIBRARY_PATH",
            "DYLD_FRAMEWORK_PATH"
        ]

        for variable in variables {

            if getenv(variable) != nil {
                return true
            }
        }

        return false
    }
}