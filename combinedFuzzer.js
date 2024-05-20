import { DRMFuzzer } from './drmFuzzer.js';
import { GPUFuzzer } from './gpuFuzzer.js';
import { DOMFuzzer } from './domFuzzer.js';
import { JSFuzzer } from './jsFuzzer.js'; // Import the new JSFuzzer
import { logger } from './operationLogger.js';

class CombinedFuzzer {
    constructor(domElements) {
        this.drmFuzzer = new DRMFuzzer();
        this.gpuFuzzer = new GPUFuzzer(domElements);
        this.domFuzzer = new DOMFuzzer(domElements);
        this.jsFuzzer = new JSFuzzer(domElements); // Initialize the JSFuzzer
    }

    async startFuzzing() {
        try {
            logger.log("startFuzzing", "Starting DRM fuzzing");
            this.drmFuzzer.startFuzzing();

            logger.log("startFuzzing", "Starting GPU fuzzing");
            await this.gpuFuzzer.startFuzzing();

            logger.log("startFuzzing", "Starting DOM fuzzing");
            await this.domFuzzer.startDOMFuzzing();

            logger.log("startFuzzing", "Starting JS fuzzing");
            await this.jsFuzzer.startFuzzing(); // Start the JSFuzzer

        } catch (error) {
            logger.log("error", `Error during fuzzing: ${error.message}`);
            console.error('Error during fuzzing:', error);
        }
    }
}

export { CombinedFuzzer };
