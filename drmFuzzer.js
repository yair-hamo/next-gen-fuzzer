import { dictionaries, generateRandomByteSequence } from './dictionaries.js';

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
        for (let i = 0; i < 10; i++) {
            try {
                const event = new MediaEncryptedEvent("encrypted", {
                    initDataType: this.getRandomFuzzValue("string"),
                    initData: generateRandomByteSequence(Math.floor(Math.random() * 256)).buffer
                });
                // console.log('Fuzzed MediaEncryptedEvent:', event);
            } catch (error) {
                // console.error('Error fuzzing MediaEncryptedEvent:', error);
            }
        }
    }

    async fuzzMediaKeyMessageEvent() {
        for (let i = 0; i < 10; i++) {
            try {
                const event = new MediaKeyMessageEvent("message", {
                    messageType: this.getRandomValidMessageType(),
                    message: generateRandomByteSequence(Math.floor(Math.random() * 1024)).buffer // Increased byte sequence length
                });
                // console.log('Fuzzed MediaKeyMessageEvent:', event);
            } catch (error) {
                // console.error('Error fuzzing MediaKeyMessageEvent:', error);
            }
        }
    }

    async fuzzMediaKeys() {
        for (let i = 0; i < 5; i++) {
            try {
                navigator.requestMediaKeySystemAccess(this.getRandomValidKeySystem(), [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    access.createMediaKeys().then(mediaKeys => {
                        // console.log('Fuzzed MediaKeys:', mediaKeys);
                        this.fuzzMediaKeySession(mediaKeys);
                    }).catch(error => {
                        // console.error('Error creating MediaKeys:', error);
                    });
                }).catch(error => {
                    // console.error('Error requesting MediaKeySystemAccess:', error);
                });
            } catch (error) {
                // console.error('Error fuzzing MediaKeys:', error);
            }
        }
    }

    async fuzzMediaKeySession(mediaKeys) {
        for (let i = 0; i < 5; i++) {
            try {
                const session = mediaKeys.createSession();
                session.addEventListener('message', (event) => {
                    // console.log('Fuzzed MediaKeySession message event:', event);
                });
                session.generateRequest('keyids', generateRandomByteSequence(Math.floor(Math.random() * 512)).buffer).then(() => {
                    // console.log('Generated request for MediaKeySession');
                }).catch(error => {
                    // console.error('Error generating request for MediaKeySession:', error);
                });
                // console.log('Fuzzed MediaKeySession:', session);
            } catch (error) {
                // console.error('Error fuzzing MediaKeySession:', error);
            }
        }
    }

    async fuzzMediaKeyStatusMap() {
        for (let i = 0; i < 5; i++) {
            try {
                navigator.requestMediaKeySystemAccess(this.getRandomValidKeySystem(), [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    access.createMediaKeys().then(mediaKeys => {
                        const session = mediaKeys.createSession();
                        const statusMap = session.keyStatuses;
                        // console.log('Fuzzed MediaKeyStatusMap:', statusMap);
                    }).catch(error => {
                        // console.error('Error creating MediaKeyStatusMap:', error);
                    });
                }).catch(error => {
                    // console.error('Error requesting MediaKeySystemAccess:', error);
                });
            } catch (error) {
                // console.error('Error fuzzing MediaKeyStatusMap:', error);
            }
        }
    }

    async fuzzMediaKeySystemAccess() {
        for (let i = 0; i < 10; i++) {
            try {
                const keySystem = this.getRandomValidKeySystem();
                navigator.requestMediaKeySystemAccess(keySystem, [{
                    initDataTypes: [this.getRandomFuzzValue("string")],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
                }]).then(access => {
                    // console.log('Fuzzed MediaKeySystemAccess:', access);
                }).catch(error => {
                    // console.error('Error fuzzing MediaKeySystemAccess:', error);
                });
            } catch (error) {
                // console.error('Error fuzzing MediaKeySystemAccess:', error);
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
