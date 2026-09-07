import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  // Privacy overlay used to protect the app-switcher snapshot
  private var privacyView: UIView?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)

    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "TestApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // MARK: - Privacy Protection

  func applicationWillResignActive(_ application: UIApplication) {
    showPrivacyView()
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    hidePrivacyView()
  }

  private func showPrivacyView() {
    guard let window = window else { return }

    // Prevent duplicate overlays
    guard privacyView == nil else { return }

    let overlay = UIView(frame: window.bounds)

    overlay.backgroundColor = .systemBackground
    overlay.autoresizingMask = [
      .flexibleWidth,
      .flexibleHeight
    ]

    // Optional app name
    let label = UILabel()
    label.text = "TestApp"
    label.font = UIFont.boldSystemFont(ofSize: 24)
    label.textColor = .label
    label.textAlignment = .center
    label.translatesAutoresizingMaskIntoConstraints = false

    overlay.addSubview(label)

    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
      label.centerYAnchor.constraint(equalTo: overlay.centerYAnchor)
    ])

    window.addSubview(overlay)
    window.bringSubviewToFront(overlay)

    privacyView = overlay
  }

  private func hidePrivacyView() {
    privacyView?.removeFromSuperview()
    privacyView = nil
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}