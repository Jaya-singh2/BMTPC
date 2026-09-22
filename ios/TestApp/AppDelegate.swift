import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    var reactNativeDelegate:
        ReactNativeDelegate?

    var reactNativeFactory:
        RCTReactNativeFactory?

    private var privacyView: UIView?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        window = UIWindow(
            frame: UIScreen.main.bounds
        )

        // =====================================
        // JAILBREAK SECURITY CHECK
        // =====================================

        #if !targetEnvironment(simulator)

        if JailbreakDetection.performJailbreakCheck() {

            showJailbreakBlockedScreen()

            return true
        }

        #endif

        // =====================================
        // START REACT NATIVE
        // =====================================

        let delegate =
            ReactNativeDelegate()

        let factory =
            RCTReactNativeFactory(
                delegate: delegate
            )

        delegate.dependencyProvider =
            RCTAppDependencyProvider()

        reactNativeDelegate =
            delegate

        reactNativeFactory =
            factory

        factory.startReactNative(
            withModuleName: "TestApp",
            in: window,
            launchOptions: launchOptions
        )

        return true
    }

    // =========================================
    // JAILBREAK BLOCK SCREEN
    // =========================================

    private func showJailbreakBlockedScreen() {

        guard let window = window else {
            return
        }

        let viewController =
            UIViewController()

        viewController.view.backgroundColor =
            .systemBackground

        let titleLabel =
            UILabel()

        titleLabel.text =
            "Security Warning"

        titleLabel.font =
            UIFont.boldSystemFont(
                ofSize: 24
            )

        titleLabel.textAlignment =
            .center

        titleLabel.textColor =
            .label

        let messageLabel =
            UILabel()

        messageLabel.text = """
        This application cannot run on a compromised device.

        Please use a device with the original iOS
        security environment.
        """

        messageLabel.font =
            UIFont.systemFont(ofSize: 16)

        messageLabel.textAlignment =
            .center

        messageLabel.numberOfLines =
            0

        messageLabel.textColor =
            .secondaryLabel

        let stack =
            UIStackView(
                arrangedSubviews: [
                    titleLabel,
                    messageLabel
                ]
            )

        stack.axis =
            .vertical

        stack.spacing =
            20

        stack.alignment =
            .fill

        stack.translatesAutoresizingMaskIntoConstraints =
            false

        viewController.view.addSubview(
            stack
        )

        NSLayoutConstraint.activate([

            stack.leadingAnchor.constraint(
                equalTo:
                    viewController.view.leadingAnchor,
                constant: 30
            ),

            stack.trailingAnchor.constraint(
                equalTo:
                    viewController.view.trailingAnchor,
                constant: -30
            ),

            stack.centerYAnchor.constraint(
                equalTo:
                    viewController.view.centerYAnchor
            )
        ])

        window.rootViewController =
            viewController

        window.makeKeyAndVisible()
    }

    // =========================================
    // PRIVACY PROTECTION
    // =========================================

    func applicationWillResignActive(
        _ application: UIApplication
    ) {
        showPrivacyView()
    }

    func applicationDidBecomeActive(
        _ application: UIApplication
    ) {
        hidePrivacyView()
    }

    private func showPrivacyView() {

        guard let window = window else {
            return
        }

        guard privacyView == nil else {
            return
        }

        let overlay =
            UIView(frame: window.bounds)

        overlay.backgroundColor =
            .systemBackground

        overlay.autoresizingMask = [
            .flexibleWidth,
            .flexibleHeight
        ]

        let label =
            UILabel()

        label.text =
            "TestApp"

        label.font =
            UIFont.boldSystemFont(
                ofSize: 24
            )

        label.textColor =
            .label

        label.textAlignment =
            .center

        label.translatesAutoresizingMaskIntoConstraints =
            false

        overlay.addSubview(label)

        NSLayoutConstraint.activate([

            label.centerXAnchor.constraint(
                equalTo:
                    overlay.centerXAnchor
            ),

            label.centerYAnchor.constraint(
                equalTo:
                    overlay.centerYAnchor
            )
        ])

        window.addSubview(
            overlay
        )

        window.bringSubviewToFront(
            overlay
        )

        privacyView =
            overlay
    }

    private func hidePrivacyView() {

        privacyView?.removeFromSuperview()

        privacyView = nil
    }
}

class ReactNativeDelegate:
    RCTDefaultReactNativeFactoryDelegate {

    override func sourceURL(
        for bridge: RCTBridge
    ) -> URL? {

        self.bundleURL()
    }

    override func bundleURL() -> URL? {

        #if DEBUG

        return RCTBundleURLProvider
            .sharedSettings()
            .jsBundleURL(
                forBundleRoot: "index"
            )

        #else

        return Bundle.main.url(
            forResource: "main",
            withExtension: "jsbundle"
        )

        #endif
    }
}