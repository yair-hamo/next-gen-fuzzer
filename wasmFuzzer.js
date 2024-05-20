import { logger } from './operationLogger.js';

class WASMFuzzer {
    constructor() {
        this.module = null;
        this.instance = null;
    }

    async loadRandomWasmModule() {
        try {
            const wasmCode = this.generateRandomWasmCode();
            this.module = await WebAssembly.compile(wasmCode);
            this.instance = await WebAssembly.instantiate(this.module, {
                env: {
                    abort: () => logger.log("abort", "WASM abort called"),
                    imported_func: this.importedFunc.bind(this)
                }
            });
            logger.log("loadRandomWasmModule", "Loaded a random WASM module");
        } catch (error) {
            logger.log("error", `Error loading WASM module: ${error.message}`);
            console.error('Error loading WASM module:', error);
        }
    }

    generateRandomWasmCode() {
        const sections = [
            // WASM binary header
            0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00,
            // Type section
            0x01, 0x0B, 0x03, 0x60, 0x00, 0x00, 0x60, 0x01, 0x7F, 0x00, 0x60, 0x02, 0x7F, 0x7F, 0x00,
            // Import section
            0x02, 0x13, 0x02, 0x07, 0x65, 0x6E, 0x76, 0x2F, 0x61, 0x62, 0x6F, 0x72, 0x74, 0x00, 0x00,
            0x07, 0x65, 0x6E, 0x76, 0x2F, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x65, 0x64, 0x5F, 0x66, 0x75, 0x6E, 0x63, 0x00, 0x01,
            // Function section
            0x03, 0x02, 0x01, 0x00,
            // Memory section
            0x05, 0x03, 0x01, 0x00, 0x10,
            // Global section
            0x06, 0x06, 0x01, 0x7F, 0x00, 0x41, 0x80, 0x88, 0x04, 0x0B,
            // Export section
            0x07, 0x11, 0x03, 0x06, 0x6D, 0x65, 0x6D, 0x6F, 0x72, 0x79, 0x02, 0x00, 0x06, 0x5F, 0x5F, 0x68, 0x65, 0x61, 0x70, 0x6C, 0x00, 0x02,
            // Code section
            0x0A, 0x1B, 0x03, 0x04, 0x00, 0x41, 0x01, 0x0B, 0x08, 0x00, 0x20, 0x00, 0x41, 0x01, 0x6A, 0x20, 0x01, 0x6A, 0x0B, 0x09, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6A, 0x20, 0x02, 0x6A, 0x0B
        ];

        // Randomly mutate some bytes
        for (let i = 0; i < 10; i++) {
            sections[Math.floor(Math.random() * sections.length)] = Math.floor(Math.random() * 256);
        }

        return new Uint8Array(sections);
    }

    async fuzzMemory() {
        try {
            const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });
            const view = new Uint8Array(memory.buffer);

            for (let i = 0; i < view.length; i++) {
                view[i] = Math.floor(Math.random() * 256);
            }
            logger.log("fuzzMemory", `Fuzzed memory with random values`);
            this.instance.exports.memory = memory;
        } catch (error) {
            logger.log("error", `Error fuzzing memory: ${error.message}`);
            console.error('Error fuzzing memory:', error);
        }
    }

    fuzzWasmExports() {
        try {
            const exports = this.instance.exports;
            for (const fn in exports) {
                if (typeof exports[fn] === 'function') {
                    for (let i = 0; i < 10; i++) {
                        try {
                            const args = Array.from({ length: exports[fn].length }, () => Math.floor(Math.random() * 10000 - 5000));
                            logger.log("fuzzWasmExports", `Calling WASM export function ${fn} with args ${args}`);
                            exports[fn](...args);
                        } catch (error) {
                            logger.log("error", `Error calling WASM export function ${fn}: ${error.message}`);
                            console.error(`Error calling WASM export function ${fn}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            logger.log("error", `Error fuzzing WASM exports: ${error.message}`);
            console.error('Error fuzzing WASM exports:', error);
        }
    }

    importedFunc() {
        try {
            const args = Array.from(arguments).map(arg => Math.floor(Math.random() * 10000 - 5000));
            logger.log("importedFunc", `Called imported function with args ${args}`);
        } catch (error) {
            logger.log("error", `Error in imported function: ${error.message}`);
            console.error('Error in imported function:', error);
        }
    }

    async startFuzzing() {
        await this.loadRandomWasmModule();
        await this.fuzzMemory();
        this.fuzzWasmExports();
    }
}

export { WASMFuzzer };
