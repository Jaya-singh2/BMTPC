import Foundation
import React

@objc(SSLPinningModule)
class SSLPinningModule: NSObject {

    // MARK: - GET

    @objc
    func get(
        _ urlString: String,
        resolver resolve:
            @escaping RCTPromiseResolveBlock,
        rejecter reject:
            @escaping RCTPromiseRejectBlock
    ) {

        performRequest(
            urlString: urlString,
            method: "GET",
            body: nil,
            resolver: resolve,
            rejecter: reject
        )
    }

    // MARK: - POST

    @objc
    func post(
        _ urlString: String,
        body: String,
        resolver resolve:
            @escaping RCTPromiseResolveBlock,
        rejecter reject:
            @escaping RCTPromiseRejectBlock
    ) {

        guard
            let bodyData =
                body.data(using: .utf8)
        else {

            reject(
                "INVALID_BODY",
                "Unable to encode request body",
                nil
            )

            return
        }

        performRequest(
            urlString: urlString,
            method: "POST",
            body: bodyData,
            resolver: resolve,
            rejecter: reject
        )
    }

    // MARK: - Perform Request

    private func performRequest(
        urlString: String,
        method: String,
        body: Data?,
        resolver resolve:
            @escaping RCTPromiseResolveBlock,
        rejecter reject:
            @escaping RCTPromiseRejectBlock
    ) {

        guard
            let url = URL(
                string: urlString
            )
        else {

            reject(
                "INVALID_URL",
                "Invalid URL",
                nil
            )

            return
        }

        /*
         Only HTTPS is allowed.
         */
        guard
            url.scheme?.lowercased()
                == "https"
        else {

            reject(
                "INVALID_SCHEME",
                "Only HTTPS requests are allowed.",
                nil
            )

            return
        }

        /*
         Only BMTPC production API is allowed.
         */
        guard
            url.host?.lowercased()
                == "vai.bmtpc.netcreativemind.com"
        else {

            reject(
                "INVALID_HOST",
                "Only the BMTPC API host is allowed.",
                nil
            )

            return
        }

        let headers: [
            String: String
        ] = [
            "Content-Type":
                "application/json",

            "Accept":
                "application/json"
        ]

        let completion:
            (Result<Data, Error>) -> Void =
            { result in

                DispatchQueue.main.async {

                    switch result {

                    case .success(let data):

                        /*
                         Try to return JSON object.
                         */
                        if let json =
                            try? JSONSerialization
                                .jsonObject(
                                    with: data,
                                    options: []
                                )
                        {

                            resolve(json)

                        } else {

                            /*
                             Return text if response
                             isn't JSON.
                             */
                            resolve(
                                String(
                                    data: data,
                                    encoding: .utf8
                                )
                            )
                        }

                    case .failure(let error):

                        reject(
                            "SSL_REQUEST_FAILED",
                            error.localizedDescription,
                            error
                        )
                    }
                }
            }

        if method.uppercased() == "POST" {

            SSLPinningManager.shared.post(
                url: url,
                headers: headers,
                body: body,
                completion: completion
            )

        } else {

            SSLPinningManager.shared.get(
                url: url,
                headers: headers,
                completion: completion
            )
        }
    }
}