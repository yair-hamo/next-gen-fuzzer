import { dictionaries, generateRandomByteSequence } from './dictionaries.js';

class JSFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.fuzzIterations = 200; // Increased number of fuzzing iterations per scenario
    }

    async startFuzzing() {
        await this.fuzzDynamicCode();
        await this.fuzzWebWorkers();
        await this.fuzzLocalStorage();
        await this.fuzzPromisesAndAsync();
        await this.fuzzReflectAndProxy();
        await this.fuzzTypedArrays();
        await this.fuzzIntlAPI();
        await this.fuzzDateAndTime();
    }

    async fuzzDynamicCode() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const randomCode = `
                    const a = ${Math.random()};
                    const b = ${Math.random()};
                    const c = (function() { return ${Math.random()}; })();
                    const d = new Function('return ' + ${Math.random()})();
                    console.log("Result: ", a + b + c + d);
                `;
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
                worker.onerror = (e) => console.error('Worker error:', e.message);
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
                const value = localStorage.getItem(key);
                localStorage.removeItem(key);
                sessionStorage.setItem(key, value);
                sessionStorage.removeItem(key);
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

                // Async/Await Fuzzing
                const asyncFunction = async () => {
                    if (Math.random() > 0.5) {
                        return this.getRandomFuzzValue('string');
                    } else {
                        throw new Error(this.getRandomFuzzValue('string'));
                    }
                };
                try {
                    const result = await asyncFunction();
                    console.log('Async function resolved with:', result);
                } catch (error) {
                    console.error('Async function rejected with:', error);
                }
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
                    bar: this.getRandomFuzzValue('number'),
                    baz: function(x) { return x * 2; }
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
                    },
                    construct: (target, args) => {
                        console.log(`Constructing with arguments: ${args}`);
                        return new target(...args.map(arg => this.getRandomFuzzValue(typeof arg)));
                    }
                };
                const proxy = new Proxy(target, handler);
                Reflect.set(proxy, 'foo', this.getRandomFuzzValue('string'));
                Reflect.get(proxy, 'foo');
                Reflect.deleteProperty(proxy, 'bar');
                Reflect.has(proxy, 'foo');
                Reflect.ownKeys(proxy);
                Reflect.apply(proxy.baz, proxy, [2]);
                Reflect.construct(function(x) { this.val = x; }, [10]);
            } catch (error) {
                console.error('Error during Reflect and Proxy fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzTypedArrays() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const buffer = new ArrayBuffer(16);
                const int8View = new Int8Array(buffer);
                const uint8View = new Uint8Array(buffer);
                const int16View = new Int16Array(buffer);
                const float32View = new Float32Array(buffer);

                int8View[Math.floor(Math.random() * int8View.length)] = Math.floor(Math.random() * 256);
                uint8View[Math.floor(Math.random() * uint8View.length)] = Math.floor(Math.random() * 256);
                int16View[Math.floor(Math.random() * int16View.length)] = Math.floor(Math.random() * 65536);
                float32View[Math.floor(Math.random() * float32View.length)] = Math.random() * 100;
            } catch (error) {
                console.error('Error during Typed Arrays fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzIntlAPI() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const locales = ['en-US', 'fr-FR', 'de-DE', this.getRandomFuzzValue('string')];
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const date = new Date();

                const numberFormat = new Intl.NumberFormat(locales, options);
                console.log('Formatted number:', numberFormat.format(Math.random() * 1000));

                const dateTimeFormat = new Intl.DateTimeFormat(locales, options);
                console.log('Formatted date:', dateTimeFormat.format(date));

                const collator = new Intl.Collator(locales, { sensitivity: 'base' });
                console.log('Collation result:', collator.compare('a', 'b'));
            } catch (error) {
                console.error('Error during Intl API fuzzing:', error);
            }
            await this.throttle();
        }
    }

    async fuzzDateAndTime() {
        for (let i = 0; i < this.fuzzIterations; i++) {
            try {
                const date = new Date(this.getRandomFuzzValue('string'));
                date.setFullYear(Math.floor(Math.random() * 3000));
                date.setMonth(Math.floor(Math.random() * 12));
                date.setDate(Math.floor(Math.random() * 31));
                date.setHours(Math.floor(Math.random() * 24));
                date.setMinutes(Math.floor(Math.random() * 60));
                date.setSeconds(Math.floor(Math.random() * 60));
                date.setMilliseconds(Math.floor(Math.random() * 1000));
                console.log('Fuzzed date:', date.toISOString());
            } catch (error) {
                console.error('Error during Date and Time fuzzing:', error);
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
