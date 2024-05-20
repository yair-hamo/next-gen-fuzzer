class OperationLogger {
    constructor() {
        this.operations = [];
    }

    log(operation, details) {
        const timestamp = new Date().toISOString();
        this.operations.push({ timestamp, operation, details });
        //console.log(`[${timestamp}] ${operation}: ${details}`);
    }

    getLogs() {
        return this.operations;
    }

    clearLogs() {
        this.operations = [];
    }
}

const logger = new OperationLogger();
export { logger };
