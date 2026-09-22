import Foundation
import Security
import CryptoKit

final class SSLPinningManager: NSObject {

    static let shared = SSLPinningManager()

    // MARK: - Configuration

    private let pinnedHost = "vai.bmtpc.netcreativemind.com"

    /*
     BMTPC SPKI SHA-256 pin.

     SHA-256:
     697fa63bfa69e6cd1525343ec98e9bb29d7728a0b95871922964ff49f6e1b3c6

     Base64:
     aX+mO/pp5s0VJTQ+yY6bsp13KKC5WHGSKWT/Sfbhs8Y=
     */
    private let pinnedSPKIHash =
        "aX+mO/pp5s0VJTQ+yY6bsp13KKC5WHGSKWT/Sfbhs8Y="

    private lazy var session: URLSession = {

        let configuration =
            URLSessionConfiguration.default

        configuration.waitsForConnectivity = false

        return URLSession(
            configuration: configuration,
            delegate: self,
            delegateQueue: nil
        )
    }()

    private override init() {
        super.init()
    }

    // MARK: - GET

    func get(
        url: URL,
        headers: [String: String] = [:],
        completion: @escaping (Result<Data, Error>) -> Void
    ) {

        var request = URLRequest(url: url)

        request.httpMethod = "GET"

        request.timeoutInterval = 30

        request.cachePolicy =
            .reloadIgnoringLocalCacheData

        for (key, value) in headers {
            request.setValue(
                value,
                forHTTPHeaderField: key
            )
        }

        execute(
            request: request,
            completion: completion
        )
    }

    // MARK: - POST

    func post(
        url: URL,
        headers: [String: String] = [:],
        body: Data?,
        completion: @escaping (Result<Data, Error>) -> Void
    ) {

        var request = URLRequest(url: url)

        request.httpMethod = "POST"

        request.timeoutInterval = 30

        request.cachePolicy =
            .reloadIgnoringLocalCacheData

        request.httpBody = body

        for (key, value) in headers {
            request.setValue(
                value,
                forHTTPHeaderField: key
            )
        }

        execute(
            request: request,
            completion: completion
        )
    }

    // MARK: - Execute Request

    private func execute(
        request: URLRequest,
        completion: @escaping (Result<Data, Error>) -> Void
    ) {

        let task =
            session.dataTask(
                with: request
            ) { data, response, error in

                if let error = error {

                    completion(
                        .failure(error)
                    )

                    return
                }

                guard let httpResponse =
                        response as? HTTPURLResponse else {

                    let error = NSError(
                        domain: "SSLPinning",
                        code: -1000,
                        userInfo: [
                            NSLocalizedDescriptionKey:
                                "Invalid server response"
                        ]
                    )

                    completion(
                        .failure(error)
                    )

                    return
                }

                guard let data = data else {

                    let error = NSError(
                        domain: "SSLPinning",
                        code: -1001,
                        userInfo: [
                            NSLocalizedDescriptionKey:
                                "Empty server response. HTTP status: \(httpResponse.statusCode)"
                        ]
                    )

                    completion(
                        .failure(error)
                    )

                    return
                }

                guard
                    (200...299)
                        .contains(
                            httpResponse.statusCode
                        )
                else {

                    let error = NSError(
                        domain: "SSLPinning",
                        code: httpResponse.statusCode,
                        userInfo: [
                            NSLocalizedDescriptionKey:
                                "HTTP error \(httpResponse.statusCode)"
                        ]
                    )

                    completion(
                        .failure(error)
                    )

                    return
                }

                completion(
                    .success(data)
                )
            }

        task.resume()
    }
}

// MARK: - SSL Pinning

extension SSLPinningManager: URLSessionDelegate {

    func urlSession(
        _ session: URLSession,
        didReceive challenge:
            URLAuthenticationChallenge,
        completionHandler:
            @escaping (
                URLSession.AuthChallengeDisposition,
                URLCredential?
            ) -> Void
    ) {

        let protectionSpace =
            challenge.protectionSpace

        // Only handle server trust challenges.
        guard
            protectionSpace.authenticationMethod
                == NSURLAuthenticationMethodServerTrust
        else {

            completionHandler(
                .performDefaultHandling,
                nil
            )

            return
        }

        // Only pin the BMTPC API host.
        guard
            protectionSpace.host.lowercased()
                == pinnedHost.lowercased()
        else {

            completionHandler(
                .performDefaultHandling,
                nil
            )

            return
        }

        // Get Apple's server trust object.
        guard
            let serverTrust =
                protectionSpace.serverTrust
        else {

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         STEP 1
         Perform Apple's normal TLS certificate validation.
         */
        var trustError: CFError?

        guard
            SecTrustEvaluateWithError(
                serverTrust,
                &trustError
            )
        else {

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         STEP 2
         Get the leaf/server certificate.
         */
        guard
            let serverCertificate =
                SecTrustGetCertificateAtIndex(
                    serverTrust,
                    0
                )
        else {

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         STEP 3
         Get the server public key.
         */
        guard
            let publicKey =
                SecCertificateCopyKey(
                    serverCertificate
                )
        else {

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         STEP 4
         Convert the RSA public key into
         SubjectPublicKeyInfo DER.
         */
        guard
            let spkiData =
                Self.createSPKIData(
                    from: publicKey
                )
        else {

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         STEP 5
         SHA-256 the complete SPKI DER.
         */
        let digest =
            SHA256.hash(
                data: spkiData
            )

        let calculatedPin =
            Data(digest)
                .base64EncodedString()

        /*
         STEP 6
         Compare the calculated pin with
         the BMTPC expected pin.
         */
        guard
            calculatedPin == pinnedSPKIHash
        else {

            #if DEBUG

            print(
                """
                ========================================
                SSL PINNING FAILED
                ========================================

                Host:
                \(protectionSpace.host)

                Calculated SPKI SHA-256:
                \(calculatedPin)

                Expected BMTPC SPKI SHA-256:
                \(pinnedSPKIHash)

                ========================================
                """
            )

            #endif

            completionHandler(
                .cancelAuthenticationChallenge,
                nil
            )

            return
        }

        /*
         BOTH checks passed:

         1. Apple TLS certificate validation
         2. BMTPC SPKI pin validation

         Allow the connection.
         */
        completionHandler(
            .useCredential,
            URLCredential(
                trust: serverTrust
            )
        )
    }
}

// MARK: - SPKI Construction

private extension SSLPinningManager {

    static func createSPKIData(
        from publicKey: SecKey
    ) -> Data? {

        /*
         Get the RSA public key in PKCS#1 format.
         */
        guard
            let rawKeyData =
                SecKeyCopyExternalRepresentation(
                    publicKey,
                    nil
                ) as Data?
        else {

            return nil
        }

        /*
         rsaEncryption OID:

         1.2.840.113549.1.1.1

         AlgorithmIdentifier:

         SEQUENCE
             OBJECT IDENTIFIER rsaEncryption
             NULL
         */
        let algorithmIdentifier =
            Data([
                0x30, 0x0D,
                0x06, 0x09,
                0x2A, 0x86, 0x48,
                0x86, 0xF7, 0x0D,
                0x01, 0x01, 0x01,
                0x05, 0x00
            ])

        /*
         SubjectPublicKeyInfo BIT STRING.

         First byte of BIT STRING content is
         number of unused bits = 0x00.
         */
        let bitStringContent =
            Data([0x00]) + rawKeyData

        guard
            let bitString =
                derEncode(
                    tag: 0x03,
                    value: bitStringContent
                )
        else {

            return nil
        }

        /*
         SubjectPublicKeyInfo:

         SEQUENCE {
             AlgorithmIdentifier,
             BIT STRING
         }
         */
        let sequenceContent =
            algorithmIdentifier + bitString

        guard
            let sequence =
                derEncode(
                    tag: 0x30,
                    value: sequenceContent
                )
        else {

            return nil
        }

        return sequence
    }

    static func derEncode(
        tag: UInt8,
        value: Data
    ) -> Data? {

        var result = Data()

        result.append(tag)

        let length = value.count

        if length < 128 {

            result.append(
                UInt8(length)
            )

        } else if length <= 0xFF {

            result.append(0x81)

            result.append(
                UInt8(length)
            )

        } else if length <= 0xFFFF {

            result.append(0x82)

            result.append(
                UInt8(
                    (length >> 8) & 0xFF
                )
            )

            result.append(
                UInt8(
                    length & 0xFF
                )
            )

        } else {

            return nil
        }

        result.append(value)

        return result
    }
}