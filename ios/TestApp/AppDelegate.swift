import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    var reactNativeDelegate: ReactNativeDelegate?

    var reactNativeFactory: RCTReactNativeFactory?

    private var privacyView: UIView?

    // MARK: - Application launch

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        window = UIWindow(
            frame: UIScreen.main.bounds
        )

        /*
         ============================================================
         PRIMARY SECURITY GATE
         ============================================================

         IMPORTANT:

         This check happens BEFORE React Native starts.

         If the device is compromised:

             NativeSecurityManager
                    ↓
                COMPROMISED
                    ↓
              BLOCK SCREEN
                    ↓
            React Native DOES NOT START

         ============================================================
        */

        let securityResult =
            NativeSecurityManager.check()

        if securityResult.isCompromised {

            showSecurityBlockedScreen()

            return true
        }

        /*
         ============================================================
         CLEAN DEVICE
         ============================================================
        */

        let delegate = ReactNativeDelegate()

        let factory =
            RCTReactNativeFactory(
                delegate: delegate
            )

        delegate.dependencyProvider =
            RCTAppDependencyProvider()

        reactNativeDelegate = delegate

        reactNativeFactory = factory

        guard let window = window else {
            return false
        }

        /*
         ============================================================
         START REACT NATIVE ONLY AFTER SECURITY CHECK
         ============================================================
        */

        factory.startReactNative(
            withModuleName: "TestApp",
            in: window,
            launchOptions: launchOptions
        )

        return true
    }

    // MARK: - Security blocked screen

    private func showSecurityBlockedScreen() {

        guard let window = window else {
            return
        }

        let viewController =
            SecurityBlockedViewController()

        window.rootViewController =
            viewController

        window.makeKeyAndVisible()
    }

    // MARK: - Privacy screen

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

        let label = UILabel()

        label.text =
            "BMTPC"

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
                equalTo: overlay.centerXAnchor
            ),

            label.centerYAnchor.constraint(
                equalTo: overlay.centerYAnchor
            )
        ])

        window.addSubview(overlay)

        window.bringSubviewToFront(
            overlay
        )

        privacyView = overlay
    }

    private func hidePrivacyView() {

        privacyView?.removeFromSuperview()

        privacyView = nil
    }
}

// MARK: - Security blocked screen

final class SecurityBlockedViewController:
    UIViewController {

    override func viewDidLoad() {

        super.viewDidLoad()

        view.backgroundColor =
            .systemBackground

        setupUI()
    }

    private func setupUI() {

        let container =
            UIView()

        container.translatesAutoresizingMaskIntoConstraints =
            false

        view.addSubview(container)

        let icon = UIImageView()

        if #available(iOS 13.0, *) {

            icon.image =
                UIImage(
                    systemName:
                        "exclamationmark.shield.fill"
                )
        }

        icon.tintColor =
            .systemRed

        icon.contentMode =
            .scaleAspectFit

        icon.translatesAutoresizingMaskIntoConstraints =
            false

        container.addSubview(icon)

        let titleLabel =
            UILabel()

        titleLabel.text =
            "Security Warning"

        titleLabel.font =
            UIFont.boldSystemFont(
                ofSize: 26
            )

        titleLabel.textColor =
            .label

        titleLabel.textAlignment =
            .center

        titleLabel.numberOfLines =
            0

        titleLabel.translatesAutoresizingMaskIntoConstraints =
            false

        container.addSubview(titleLabel)

        let messageLabel =
            UILabel()

        messageLabel.text =
            """
            This application cannot run on a compromised device.

            Please use an iOS device with the original security environment.
            """

        messageLabel.font =
            UIFont.systemFont(
                ofSize: 17
            )

        messageLabel.textColor =
            .secondaryLabel

        messageLabel.textAlignment =
            .center

        messageLabel.numberOfLines =
            0

        messageLabel.translatesAutoresizingMaskIntoConstraints =
            false

        container.addSubview(messageLabel)

        NSLayoutConstraint.activate([

            container.centerXAnchor.constraint(
                equalTo: view.centerXAnchor
            ),

            container.centerYAnchor.constraint(
                equalTo: view.centerYAnchor
            ),

            container.leadingAnchor.constraint(
                greaterThanOrEqualTo:
                    view.leadingAnchor,
                constant: 30
            ),

            container.trailingAnchor.constraint(
                lessThanOrEqualTo:
                    view.trailingAnchor,
                constant: -30
            ),

            icon.widthAnchor.constraint(
                equalToConstant: 70
            ),

            icon.heightAnchor.constraint(
                equalToConstant: 70
            ),

            icon.centerXAnchor.constraint(
                equalTo: container.centerXAnchor
            ),

            icon.topAnchor.constraint(
                equalTo: container.topAnchor
            ),

            titleLabel.topAnchor.constraint(
                equalTo: icon.bottomAnchor,
                constant: 24
            ),

            titleLabel.leadingAnchor.constraint(
                equalTo: container.leadingAnchor
            ),

            titleLabel.trailingAnchor.constraint(
                equalTo: container.trailingAnchor
            ),

            messageLabel.topAnchor.constraint(
                equalTo: titleLabel.bottomAnchor,
                constant: 16
            ),

            messageLabel.leadingAnchor.constraint(
                equalTo: container.leadingAnchor
            ),

            messageLabel.trailingAnchor.constraint(
                equalTo: container.trailingAnchor
            ),

            messageLabel.bottomAnchor.constraint(
                equalTo: container.bottomAnchor
            )
        ])
    }

    /*
     Prevent the user from dismissing or navigating away
     from the security screen.
    */

    override var shouldAutorotate: Bool {
        return false
    }
}

// MARK: - React Native delegate

class ReactNativeDelegate:
    RCTDefaultReactNativeFactoryDelegate {

    override func sourceURL(
        for bridge: RCTBridge
    ) -> URL? {

        self.bundleURL()
    }

    override func bundleURL() -> URL? {

        #if DEBUG

        return RCTBundleURLProvider.sharedSettings()
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