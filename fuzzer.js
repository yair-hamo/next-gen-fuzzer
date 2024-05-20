import { dictionaries } from './dictionaries.js';

class Fuzzer {
    constructor(targetObjects) {
        this.targetObjects = targetObjects;
        this.dictionaries = dictionaries;
    }

    fuzzObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            //console.error('Cannot create proxy for non-object:', obj);
            return obj;
        }
        return new Proxy(obj, this.createProxyHandler());
    }

    createProxyHandler() {
        const handler = {
            get: (target, prop, receiver) => {
                try {
                    //console.log(`Getting ${prop}`);
                    if (typeof target[prop] === 'function') {
                        return this.fuzzFunction(target[prop]);
                    } else if (typeof target[prop] === 'object' && target[prop] !== null) {
                        return this.fuzzObject(target[prop]);
                    }
                    return target[prop];
                } catch (error) {
                    //console.error(`Error getting property ${prop}:`, error);
                }
            },
            set: (target, prop, value) => {
                try {
                    //console.log(`Setting ${prop} to ${value}`);
                    target[prop] = value;
                    return true;
                } catch (error) {
                    //console.error(`Error setting property ${prop} to ${value}:`, error);
                }
            }
        };
        return handler;
    }

    fuzzFunction(fn) {
        return (...args) => {
            const fuzzedArgs = args.map(arg => this.getRandomFuzzValue(arg));
            //console.log(`Calling function with args: ${fuzzedArgs}`);
            try {
                return fn(...fuzzedArgs);
            } catch (error) {
                //console.error('Error calling function with fuzzed args:', error);
            }
        };
    }

    getRandomFuzzValue(arg) {
        const type = typeof arg;
        const dict = this.dictionaries[type] || [];
        return dict.length > 0 ? dict[Math.floor(Math.random() * dict.length)] : arg;
    }

    startFuzzing() {
        this.targetObjects.forEach(obj => {
            if (typeof obj === 'object' && obj !== null) {
                this.fuzzObject(obj);
            } else {
                //console.warn('Target object is not available or is not an object:', obj);
            }
        });
    }
}

export { Fuzzer };
