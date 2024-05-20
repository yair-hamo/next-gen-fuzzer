import { dictionaries, generateRandomByteSequence } from './dictionaries.js';

class JSFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.fuzzIterations = 100; // Number of fuzzing iterations per scenario
    }

    async startFuzzing() {
        await this.fuzzDynamicCode();
        await this.fuzzWebWorkers();
        await this.fuzzLocalStorage();
        await this.fuzzPromisesAndAsync();
        await this.fuzzReflectAndProxy();
    }

    async fuzzDynamicCode() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const randomCode = `
                    const a = ${Math.random()};
                    const b = ${Math.random()};
                    console.log("Result: ", a + b);`;
                new Function(randomCode)();
            } catch (error) {
                console.error('Error during dynamic code execution fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzWebWorkers() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const blob = new Blob([`
                    onmessage = function(e) {
                        postMessage("Worker received: " + e.data);
                    }
                `], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.postMessage(this.getRandomFuzzValue('string'));
                worker.onmessage = (e) => console.log('Worker response:', e.data);
            } catch (error) {
                console.error('Error during Web Workers fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzLocalStorage() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                localStorage.setItem(this.getRandomFuzzValue('string'), this.getRandomFuzzValue('string'));
                const key = localStorage.key(Math.floor(Math.random() * localStorage.length));
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error during localStorage fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzPromisesAndAsync() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const promise = new Promise((resolve, reject) => {
                    if (Math.random() > 0.5) {
                        resolve(this.getRandomFuzzValue('string'));
                    } else {
                        reject(new Error(this.getRandomFuzzValue('string')));
                    }
                });
                await promise
                    .then(result => console.log('Promise resolved with:', result))
                    .catch(error => console.error('Promise rejected with:', error));
            } catch (error) {
                console.error('Error during promises and async fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzReflectAndProxy() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const target = {
                    foo: this.getRandomFuzzValue('string'),
                    bar: this.getRandomFuzzValue('number')
                };
                const handler = {
                    get: (obj, prop) => {
                        console.log(`Getting ${prop}`);
                        return prop in obj ? obj[prop] : 42;
                    },
                    set: (obj, prop, value) => {
                        console.log(`Setting ${prop} to ${value}`);
                        obj[prop] = value;
                        return true;
                    },
                    deleteProperty: (obj, prop) => {
                        console.log(`Deleting ${prop}`);
                        return delete obj[prop];
                    },
                    has: (obj, prop) => {
                        console.log(`Checking if ${prop} exists`);
                        return prop in obj;
                    },
                    ownKeys: (obj) => {
                        console.log('Getting own keys');
                        return Reflect.ownKeys(obj);
                    },
                    apply: (target, thisArg, argumentsList) => {
                        console.log(`Applying function with arguments: ${argumentsList}`);
                        return target.apply(thisArg, argumentsList.map(arg => this.getRandomFuzzValue(typeof arg)));
                    }
                };
                const proxy = new Proxy(target, handler);
                Reflect.set(proxy, 'foo', this.getRandomFuzzValue('string'));
                Reflect.get(proxy, 'foo');
                Reflect.deleteProperty(proxy, 'bar');
                Reflect.has(proxy, 'foo');
                Reflect.ownKeys(proxy);
            } catch (error) {
                console.error('Error during Reflect and Proxy fuzzing:', error);
            }
            await this.throttle();
        }
    }

    getRandomFuzzValue(type) {
        const dict = this.dictionaries[type] || [];
        return dict.length > 0 ? dict[Math.floor(Math.random() * dict.length)] : "";
    }

    async throttle() {
        return new Promise(resolve => setTimeout(resolve, 10));
    }
}

export { JSFuzzer };
