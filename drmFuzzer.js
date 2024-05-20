import { dictionaries, generateRandomByteSequence } from './dictionaries.js';
import { logger } from './operationLogger.js';

class DRMFuzzer {
    constructor() {
        this.dictionaries = dictionaries;
        this.validMessageTypes = ["license-request", "license-renewal", "license-release", "individualization-request"];
        this.validKeySystems = [
            "org.w3.clearkey", "com.widevine.alpha", "com.microsoft.playready", "com.adobe.primetime",
            "org.mozilla.clearkey", "com.apple.fairplay", "org.chromium.fakekeysystem"
        ];
    }

    async fuzzMediaEncryptedEvent() {
        for (let i = 0; i < 20; i++) {
            try {
                const event = new MediaEncryptedEvent("encrypted", {
                    initDataType: this.getRandomFuzzValue("string"),
                    initData: generateRandomByteSequence(Math.floor(Math.random() * 512)).buffer // Increased byte sequence length
                });
                logger.log("fuzzMediaEncryptedEvent", `Fuzzed MediaEncryptedEvent: ${JSON.stringify(event)}`);
            } catch (error) {
                logger.log("error", `Error fuzzing MediaEncryptedEvent: ${error.message}`);
            }
        }
    }

    async fuzzMediaKeyMessageEvent() {
        for (let i = 0; i < 20; i++) {
            try {
                const event = new MediaKeyMessageEvent("message", {
                    messageType: this.getRandomValidMessageType(),
                    message: generateRandomByteSequence(Math.floor(Math.random() * 2048)).buffer // Increased byte sequence length
                });
                logger.log("fuzzMediaKeyMessageEvent", `Fuzzed MediaKeyMessageEvent: ${JSON.stringify(event)}`);
            } catch (error) {
                logger.log("error", `Error fuzzing MediaKeyMessageEvent: ${error.message}`);
            }
        }
    }

    async fuzzMediaKeys() {
        for (let i = 0; i < 10; i++) {
            try {
                navigator.requestMediaKeySystemAccess(this.getRandomValidKeySystem(), [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    access.createMediaKeys().then(mediaKeys => {
                        logger.log("fuzzMediaKeys", `Fuzzed MediaKeys: ${JSON.stringify(mediaKeys)}`);
                        this.fuzzMediaKeySession(mediaKeys);
                    }).catch(error => {
                        logger.log("error", `Error creating MediaKeys: ${error.message}`);
                    });
                }).catch(error => {
                    logger.log("error", `Error requesting MediaKeySystemAccess: ${error.message}`);
                });
            } catch (error) {
                logger.log("error", `Error fuzzing MediaKeys: ${error.message}`);
            }
        }
    }

    async fuzzMediaKeySession(mediaKeys) {
        for (let i = 0; i < 10; i++) {
            try {
                const session = mediaKeys.createSession();
                session.addEventListener('message', (event) => {
                    logger.log("fuzzMediaKeySession", `Fuzzed MediaKeySession message event: ${JSON.stringify(event)}`);
                });
                session.generateRequest('keyids', generateRandomByteSequence(Math.floor(Math.random() * 1024)).buffer).then(() => {
                    logger.log("fuzzMediaKeySession", `Generated request for MediaKeySession`);
                }).catch(error => {
                    logger.log("error", `Error generating request for MediaKeySession: ${error.message}`);
                });
                logger.log("fuzzMediaKeySession", `Fuzzed MediaKeySession: ${JSON.stringify(session)}`);
            } catch (error) {
                logger.log("error", `Error fuzzing MediaKeySession: ${error.message}`);
            }
        }
    }

    async fuzzMediaKeyStatusMap() {
        for (let i = 0; i < 10; i++) {
            try {
                navigator.requestMediaKeySystemAccess(this.getRandomValidKeySystem(), [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    access.createMediaKeys().then(mediaKeys => {
                        const session = mediaKeys.createSession();
                        const statusMap = session.keyStatuses;
                        logger.log("fuzzMediaKeyStatusMap", `Fuzzed MediaKeyStatusMap: ${JSON.stringify(statusMap)}`);
                    }).catch(error => {
                        logger.log("error", `Error creating MediaKeyStatusMap: ${error.message}`);
                    });
                }).catch(error => {
                    logger.log("error", `Error requesting MediaKeySystemAccess: ${error.message}`);
                });
            } catch (error) {
                logger.log("error", `Error fuzzing MediaKeyStatusMap: ${error.message}`);
            }
        }
    }

    async fuzzMediaKeySystemAccess() {
        for (let i = 0; i < 20; i++) {
            try {
                const keySystem = this.getRandomValidKeySystem();
                navigator.requestMediaKeySystemAccess(keySystem, [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    logger.log("fuzzMediaKeySystemAccess", `Fuzzed MediaKeySystemAccess: ${JSON.stringify(access)}`);
                }).catch(error => {
                    logger.log("error", `Error fuzzing MediaKeySystemAccess: ${error.message}`);
                });
            } catch (error) {
                logger.log("error", `Error fuzzing MediaKeySystemAccess: ${error.message}`);
            }
        }
    }

    getRandomValidMessageType() {
        return this.validMessageTypes[Math.floor(Math.random() * this.validMessageTypes.length)];
    }

    getRandomValidKeySystem() {
        return this.validKeySystems[Math.floor(Math.random() * this.validKeySystems.length)];
    }

    getRandomFuzzValue(type) {
        const dict = this.dictionaries[type] || [];
        return dict.length > 0 ? dict[Math.floor(Math.random() * dict.length)] : "";
    }

    async startFuzzing() {
        await Promise.all([
            this.fuzzMediaEncryptedEvent(),
            this.fuzzMediaKeyMessageEvent(),
            this.fuzzMediaKeys(),
            this.fuzzMediaKeySession(),
            this.fuzzMediaKeyStatusMap(),
            this.fuzzMediaKeySystemAccess()
        ]);
    }
}

export { DRMFuzzer };
