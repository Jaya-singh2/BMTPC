import Foundation
import UIKit
import Darwin
import MachO

final class NativeSecurityManager {

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

    // MARK: - Primary security gate

    static func check() -> SecurityResult {

        #if targetEnvironment(simulator)
        return .allowed
        #else

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

        if checkExecutableIntegrityIndicators() {
            return .compromised
        }

        return .allowed

        #endif
    }

    // MARK: - Secondary React Native check

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

        if checkExecutableIntegrityIndicators() {
            return true
        }

        return false

        #endif
    }

    // MARK: - 1. Jailbreak files

    private static func checkKnownJailbreakFiles() -> Bool {

        let suspiciousPaths = [

            "/Applications/Cydia.app",
            "/private/Applications/Cydia.app",

            "/Applications/Sileo.app",
            "/private/Applications/Sileo.app",

            "/Applications/Zebra.app",
            "/private/Applications/Zebra.app",

            "/Applications/Filza.app",

            "/Library/MobileSubstrate",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",

            "/usr/lib/substitute-inserter.dylib",
            "/usr/lib/substitute-loader.dylib",

            "/usr/lib/libhooker.dylib",

            "/usr/lib/ellekit.dylib",
            "/var/jb/usr/lib/ellekit.dylib",

            "/usr/sbin/sshd",
            "/usr/bin/ssh",

            "/bin/bash",
            "/bin/sh",
            "/usr/bin/bash",
            "/usr/bin/zsh",

            "/etc/apt",
            "/private/var/lib/apt",
            "/private/var/lib/cydia",

            "/private/var/stash",

            "/var/jb",
            "/var/jb/usr/bin",
            "/var/jb/Applications",

            "/private/preboot/jb",

            "/usr/sbin/frida-server",
            "/usr/bin/frida-server",
            "/usr/local/bin/frida-server"
        ]

        for path in suspiciousPaths {

            if FileManager.default.fileExists(
                atPath: path
            ) {
                return true
            }
        }

        return false
    }

    // MARK: - 2. Sandbox escape

    private static func checkSandboxIntegrity() -> Bool {

        let testPath =
            "/private/bmtpc_security_test_\(UUID().uuidString)"

        do {

            let data =
                Data("BMTPC_SECURITY_TEST".utf8)

            try data.write(
                to: URL(fileURLWithPath: testPath),
                options: [.atomic]
            )

            try? FileManager.default.removeItem(
                atPath: testPath
            )

            // Successfully wrote outside the
            // application's sandbox.
            return true

        } catch {

            return false
        }
    }

    // MARK: - 3. UID / EUID

    private static func checkUIDIntegrity() -> Bool {

        let uid = getuid()
        let euid = geteuid()

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

            "FRIDA",
            "FRIDA_GADGET",

            "SUBSTRATE",
            "SUBSTITUTE",
            "LIBHOOKER",
            "ELLEKIT"
        ]

        let environment =
            ProcessInfo.processInfo.environment

        for variable in suspiciousVariables {

            if let value = environment[variable],
               !value.isEmpty {

                return true
            }
        }

        return false
    }

    // MARK: - 5. Debugger

    private static func checkDebugger() -> Bool {

        var processInfo = kinfo_proc()

        var size =
            MemoryLayout<kinfo_proc>.stride

        var name: [Int32] = [
            CTL_KERN,
            KERN_PROC,
            KERN_PROC_PID,
            getpid()
        ]

        let result =
            name.withUnsafeMutableBufferPointer {
                pointer in

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

        return (
            processInfo.kp_proc.p_flag &
            P_TRACED
        ) != 0
    }

    // MARK: - 6. Dynamic libraries

    private static func checkSuspiciousDynamicLibraries() -> Bool {

        let suspiciousLibraries = [

            "frida",
            "frida-gadget",
            "fridagadget",

            "MobileSubstrate",
            "Substrate",
            "SubstrateLoader",

            "libhooker",

            "substitute",
            "substitute-loader",

            "ellekit",
            "ElleKit",

            "TweakInject",

            "cycript",
            "cynject",

            "rocketbootstrap"
        ]

        let imageCount =
            _dyld_image_count()

        for index in 0..<imageCount {

            guard let pointer =
                    _dyld_get_image_name(index)
            else {
                continue
            }

            let imageName =
                String(cString: pointer)

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

    // MARK: - 7. Runtime classes

    private static func checkSuspiciousRuntimeClasses() -> Bool {

        let suspiciousClasses = [

            "FridaGadget",
            "FLEXManager",
            "Cycript",
            "Substrate",
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

    // MARK: - 8. Executable consistency

    private static func checkExecutableIntegrityIndicators() -> Bool {

        guard let executablePath =
                Bundle.main.executablePath
        else {
            return true
        }

        let executableURL =
            URL(fileURLWithPath: executablePath)
                .standardizedFileURL

        let bundleURL =
            Bundle.main.bundleURL
                .standardizedFileURL

        let executable =
            executableURL.path

        let bundle =
            bundleURL.path

        if !executable.hasPrefix(bundle) {
            return true
        }

        var isDirectory =
            ObjCBool(false)

        let exists =
            FileManager.default.fileExists(
                atPath: executable,
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