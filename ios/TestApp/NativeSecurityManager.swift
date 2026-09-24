import Foundation
import UIKit
import Darwin
import MachO

final class NativeSecurityManager {

    // MARK: - Security result

    enum SecurityResult {
        case allowed
        case compromised

        var isCompromised: Bool {
            switch self {
            case .allowed:
                return false

            case .compromised:
                return true
            }
        }
    }

    // MARK: - Main security gate

    static func check() -> SecurityResult {

        #if targetEnvironment(simulator)
        return .allowed
        #else

        /*
         IMPORTANT:

         This function is called BEFORE React Native starts.

         Do not expose this function to React Native.
         Do not make the launch decision from JavaScript.
        */

        if checkKnownJailbreakFiles() {
            return .compromised
        }

        if checkSandboxIntegrity() {
            return .compromised
        }

        if checkUIDIntegrity() {
            return .compromised
        }

        if checkEnvironmentVariables() {
            return .compromised
        }

        if checkDebugger() {
            return .compromised
        }

        if checkSuspiciousDynamicLibraries() {
            return .compromised
        }

        if checkSuspiciousRuntimeClasses() {
            return .compromised
        }

        if checkSuspiciousURLSchemes() {
            return .compromised
        }

        if checkExecutableIntegrityIndicators() {
            return .compromised
        }

        return .allowed

        #endif
    }

    // MARK: - Jailbreak checks

    static func performJailbreakChecks() -> Bool {

        #if targetEnvironment(simulator)
        return false
        #else

        if checkKnownJailbreakFiles() {
            return true
        }

        if checkSandboxIntegrity() {
            return true
        }

        if checkUIDIntegrity() {
            return true
        }

        if checkEnvironmentVariables() {
            return true
        }

        if checkDebugger() {
            return true
        }

        if checkSuspiciousDynamicLibraries() {
            return true
        }

        if checkSuspiciousRuntimeClasses() {
            return true
        }

        if checkSuspiciousURLSchemes() {
            return true
        }

        if checkExecutableIntegrityIndicators() {
            return true
        }

        return false

        #endif
    }

    // MARK: - 1. Known jailbreak paths

    private static func checkKnownJailbreakFiles() -> Bool {

        let suspiciousPaths = [

            // Cydia
            "/Applications/Cydia.app",
            "/private/Applications/Cydia.app",

            // Sileo
            "/Applications/Sileo.app",
            "/private/Applications/Sileo.app",

            // Zebra
            "/Applications/Zebra.app",
            "/private/Applications/Zebra.app",

            // Substrate
            "/Library/MobileSubstrate",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",

            // Substitute
            "/usr/lib/substitute-inserter.dylib",
            "/usr/lib/substitute-loader.dylib",

            // libhooker
            "/usr/lib/libhooker.dylib",
            "/Library/MobileSubstrate/DynamicLibraries/libhooker.dylib",

            // ElleKit
            "/usr/lib/ellekit.dylib",
            "/var/jb/usr/lib/ellekit.dylib",

            // SSH
            "/usr/sbin/sshd",
            "/usr/bin/ssh",
            "/usr/libexec/ssh-keysign",

            // Shells
            "/bin/bash",
            "/bin/sh",
            "/usr/bin/bash",
            "/usr/bin/zsh",

            // Package managers
            "/etc/apt",
            "/private/var/lib/apt",
            "/private/var/lib/cydia",

            // Jailbreak locations
            "/private/var/stash",
            "/var/jb",
            "/var/jb/usr/bin",
            "/var/jb/Applications",
            "/private/preboot/jb",

            // Rootless jailbreak paths
            "/private/preboot",
            "/private/var/mobile/Library/Preferences/com.apple.jailbreak.plist",

            // Frida-related common locations
            "/usr/sbin/frida-server",
            "/usr/bin/frida-server",
            "/usr/local/bin/frida-server",

            // Filza
            "/Applications/Filza.app",

            // Installer
            "/Applications/Installer.app"
        ]

        for path in suspiciousPaths {

            if FileManager.default.fileExists(atPath: path) {
                return true
            }
        }

        return false
    }

    // MARK: - 2. Sandbox integrity

    private static func checkSandboxIntegrity() -> Bool {

        /*
         A normal iOS application should not be able to create
         arbitrary files in locations outside its sandbox.

         This is only one signal, not the sole security control.
        */

        let testPath = "/private/bmtpc_security_test_\(UUID().uuidString)"

        do {

            let testData = Data("BMTPC_SECURITY_TEST".utf8)

            try testData.write(
                to: URL(fileURLWithPath: testPath),
                options: [.atomic]
            )

            // If we reached this point, writing succeeded.
            try? FileManager.default.removeItem(
                atPath: testPath
            )

            return true

        } catch {

            return false
        }
    }

    // MARK: - 3. UID / EUID check

    private static func checkUIDIntegrity() -> Bool {

        let uid = getuid()
        let euid = geteuid()

        /*
         Normal iOS application processes should not run as root.

         root UID = 0
        */

        if uid == 0 {
            return true
        }

        if euid == 0 {
            return true
        }

        return false
    }

    // MARK: - 4. Environment variables

    private static func checkEnvironmentVariables() -> Bool {

        let suspiciousVariables = [

            "DYLD_INSERT_LIBRARIES",
            "DYLD_LIBRARY_PATH",
            "DYLD_FRAMEWORK_PATH",
            "DYLD_FALLBACK_LIBRARY_PATH",
            "DYLD_FALLBACK_FRAMEWORK_PATH",

            // Instrumentation / profiling indicators
            "FRIDA",
            "FRIDA_GADGET",

            // Common injection indicators
            "SUBSTRATE",
            "SUBSTITUTE",
            "LIBHOOKER",
            "ELLEKIT"
        ]

        let environment = ProcessInfo.processInfo.environment

        for variable in suspiciousVariables {

            if let value = environment[variable],
               !value.isEmpty {

                return true
            }
        }

        return false
    }

    // MARK: - 5. Debugger detection

    private static func checkDebugger() -> Bool {

        var processInfo = kinfo_proc()

        var size = MemoryLayout<kinfo_proc>.stride

        var name: [Int32] = [
            CTL_KERN,
            KERN_PROC,
            KERN_PROC_PID,
            getpid()
        ]

        let result = name.withUnsafeMutableBufferPointer { pointer in

            sysctl(
                pointer.baseAddress,
                u_int(pointer.count),
                &processInfo,
                &size,
                nil,
                0
            )
        }

        if result != 0 {
            return false
        }

        let traced = (processInfo.kp_proc.p_flag & P_TRACED) != 0

        return traced
    }

    // MARK: - 6. Suspicious dynamic libraries

    private static func checkSuspiciousDynamicLibraries() -> Bool {

        let suspiciousLibraries = [

            "frida",
            "frida-gadget",
            "fridagadget",

            "MobileSubstrate",
            "Substrate",
            "SubstrateLoader",

            "libhooker",
            "libhooker.dylib",

            "substitute",
            "substitute-loader",

            "ellekit",
            "ElleKit",

            "TweakInject",

            "cycript",
            "cynject",

            "libshadow",

            "rocketbootstrap",

            "shadow"
        ]

        let imageCount = _dyld_image_count()

        if imageCount <= 0 {
            return false
        }

        for index in 0..<imageCount {

            guard let imageNamePointer = _dyld_get_image_name(index) else {
                continue
            }

            let imageName = String(
                cString: imageNamePointer
            )

            for suspiciousLibrary in suspiciousLibraries {

                if imageName.localizedCaseInsensitiveContains(
                    suspiciousLibrary
                ) {
                    return true
                }
            }
        }

        return false
    }

    // MARK: - 7. Suspicious Objective-C runtime classes

    private static func checkSuspiciousRuntimeClasses() -> Bool {

        let suspiciousClasses = [

            "FridaGadget",

            "FLEXManager",

            "Cycript",

            "Substrate",
            "MSHook",

            "Substitute",

            "Libhooker",

            "ElleKit",

            "TweakInject"
        ]

        for className in suspiciousClasses {

            if NSClassFromString(className) != nil {
                return true
            }
        }

        return false
    }

    // MARK: - 8. Suspicious URL schemes

    private static func checkSuspiciousURLSchemes() -> Bool {

        let suspiciousSchemes = [

            "cydia",
            "sileo",
            "zbra"
        ]

        for scheme in suspiciousSchemes {

            guard let url = URL(
                string: "\(scheme)://"
            ) else {
                continue
            }

            if UIApplication.shared.canOpenURL(url) {
                return true
            }
        }

        return false
    }

    // MARK: - 9. Executable indicators

    private static func checkExecutableIntegrityIndicators() -> Bool {

        guard let executablePath =
                Bundle.main.executablePath else {
            return true
        }

        /*
         The application executable must be inside the
         installed application bundle.

         This is an additional consistency check.
        */

        let normalizedPath =
            URL(fileURLWithPath: executablePath)
                .standardizedFileURL
                .path

        let bundlePath =
            Bundle.main.bundleURL
                .standardizedFileURL
                .path

        if !normalizedPath.hasPrefix(bundlePath) {
            return true
        }

        /*
         Check that the executable exists and is a regular file.
        */

        var isDirectory: ObjCBool = false

        let exists = FileManager.default.fileExists(
            atPath: normalizedPath,
            isDirectory: &isDirectory
        )

        if !exists {
            return true
        }

        if isDirectory.boolValue {
            return true
        }

        return false
    }
}