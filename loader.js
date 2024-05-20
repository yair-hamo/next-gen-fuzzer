import { CombinedFuzzer } from './combinedFuzzer.js';
import { logger } from './operationLogger.js';

const domElements = [
    document.getElementById('gpuCanvas'),
    document.getElementById('mediaElement')
];

const combinedFuzzer = new CombinedFuzzer(domElements);

document.getElementById('startFuzzing').addEventListener('click', async () => {
    logger.clearLogs();

    const selectedFuzzers = [];
    if (document.getElementById('domFuzzer').checked) selectedFuzzers.push('domFuzzer');
    if (document.getElementById('gpuFuzzer').checked) selectedFuzzers.push('gpuFuzzer');
    if (document.getElementById('drmFuzzer').checked) selectedFuzzers.push('drmFuzzer');
    if (document.getElementById('jsFuzzer').checked) selectedFuzzers.push('jsFuzzer'); // Add JS Fuzzer to the list

    try {
        setInterval(() => {try {combinedFuzzer.startFuzzing();} catch (error) {}}, 1);
    } catch (error) {
        console.error('Error in fuzzing process:', error);
    }
});

document.getElementById('showLogs').addEventListener('click', () => {
    const logsDiv = document.getElementById('logs');
    logsDiv.textContent = JSON.stringify(logger.getLogs(), null, 2);
});
