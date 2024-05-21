import { dictionaries } from './dictionaries.js';

class DOMFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.maxDepth = 25; // Further increased depth for exhaustive fuzzing
        this.throttleTime = 0.5; // Reduced throttle time for even faster fuzzing
        this.raceConditionTime = 0.5; // More aggressive race condition interval
    }

    async fuzzDOMElement(element, depth = 0) {
        if (depth > this.maxDepth) return;

        // Randomly set attributes with mutation-based fuzzing
        for (let i = 0; i < 150; i++) {
            try {
                const randomAttr = `data-fuzz-${Math.random().toString(36).substring(2, 7)}`;
                element.setAttribute(randomAttr, this.getRandomFuzzValue("string"));
                element.setAttribute(randomAttr, this.mutateString(element.getAttribute(randomAttr)));
                await this.throttle();
            } catch (error) {}
        }

        // Randomly modify styles
        const styles = [
            'color', 'backgroundColor', 'border', 'width', 'height', 'fontSize',
            'margin', 'padding', 'opacity', 'display', 'position', 'top', 'left',
            'transform', 'zIndex', 'flex', 'grid', 'boxShadow', 'borderRadius', 'clipPath',
            'filter', 'backdropFilter', 'animation', 'transition', 'cursor', 'outline', 'visibility'
        ];
        for (const style of styles) {
            try {
                element.style[style] = this.getRandomStyleValue(style);
                await this.throttle();
            } catch (error) {}
        }

        // Trigger various events
        const events = [
            'click', 'mouseover', 'mouseout', 'focus', 'blur', 'keydown',
            'keyup', 'change', 'input', 'dblclick', 'contextmenu', 'wheel',
            'submit', 'reset', 'dragstart', 'dragover', 'drop', 'copy', 'cut', 'paste',
            'animationstart', 'animationiteration', 'animationend', 'touchstart', 'touchend', 'touchmove',
            'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave'
        ];
        for (const event of events) {
            try {
                const evt = new Event(event, { bubbles: true, cancelable: true });
                element.dispatchEvent(evt);
                await this.throttle();
            } catch (error) {}
        }

        // Modify innerHTML and textContent
        try {
            element.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
            element.textContent = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
        } catch (error) {}

        // Modify value if it's an input element
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            try {
                element.value = this.mutateString(this.getRandomFuzzValue("string"));
                await this.throttle();
            } catch (error) {}
        }

        // Inject dynamic scripts
        await this.injectDynamicScripts(element);

        // Modify attributes
        await this.modifyAttributes(element);

        // Handle nested elements
        await this.fuzzNestedElements(element, depth);

        // Apply transformations
        await this.applyTransformations(element);

        // Add structural fuzzing
        await this.addStructuralFuzzing(element);

        // Introduce race condition fuzzing
        this.createRaceCondition(element, depth);
    }

    createRaceCondition(element, depth) {
        // Start multiple asynchronous operations on the same element
        const operations = [
            () => this.modifyAttributes(element),
            () => this.modifyStyles(element),
            () => this.triggerEvents(element),
            () => this.modifyContent(element),
            () => this.structuralChanges(element),
            () => this.applyTransformations(element) // Added transformations to race conditions
        ];

        for (let op of operations) {
            setInterval(() => {
                try {
                    op();
                } catch (error) {
                    // Handle errors silently
                }
            }, this.raceConditionTime);
        }
    }

    async modifyAttributes(element) {
        const attributes = ['title', 'alt', 'placeholder', 'src', 'href', 'class', 'id', 'name', 'role', 'aria-label', 'data-random', 'data-test', 'aria-hidden', 'aria-live', 'tabindex', 'contenteditable', 'draggable', 'spellcheck'];
        for (const attr of attributes) {
            try {
                element.setAttribute(attr, this.mutateString(this.getRandomFuzzValue("string")));
                await this.throttle();
            } catch (error) {}
        }
    }

    async modifyStyles(element) {
        const styles = ['color', 'backgroundColor', 'border', 'width', 'height', 'fontSize', 'margin', 'padding', 'opacity', 'display', 'position', 'top', 'left', 'transform', 'zIndex', 'flex', 'grid', 'boxShadow', 'borderRadius', 'clipPath', 'filter', 'backdropFilter', 'animation', 'transition', 'cursor', 'outline', 'visibility'];
        for (const style of styles) {
            try {
                element.style[style] = this.getRandomStyleValue(style);
                await this.throttle();
            } catch (error) {}
        }
    }

    async triggerEvents(element) {
        const events = ['click', 'mouseover', 'mouseout', 'focus', 'blur', 'keydown', 'keyup', 'change', 'input', 'dblclick', 'contextmenu', 'wheel', 'submit', 'reset', 'dragstart', 'dragover', 'drop', 'copy', 'cut', 'paste', 'animationstart', 'animationiteration', 'animationend', 'touchstart', 'touchend', 'touchmove', 'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave'];
        for (const event of events) {
            try {
                const evt = new Event(event, { bubbles: true, cancelable: true });
                element.dispatchEvent(evt);
                await this.throttle();
            } catch (error) {}
        }
    }

    async modifyContent(element) {
        try {
            element.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
            element.textContent = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = this.mutateString(this.getRandomFuzzValue("string"));
                await this.throttle();
            }
        } catch (error) {}
    }

    async structuralChanges(element) {
        const structuralOperations = [
            () => element.appendChild(document.createElement('div')),
            () => element.removeChild(element.firstChild),
            () => element.insertBefore(document.createElement('span'), element.firstChild),
            () => element.replaceChild(document.createElement('p'), element.firstChild),
            () => element.innerHTML = `<div>${element.innerHTML}</div>`,
            () => element.outerHTML = `<section>${element.outerHTML}</section>`,
            () => element.innerHTML = `<img src="https://via.placeholder.com/150" />`,
            () => element.innerHTML += `<div>${this.mutateString(this.getRandomFuzzValue("string"))}</div>`,
            () => element.insertAdjacentHTML('beforebegin', `<div>${this.mutateString(this.getRandomFuzzValue("string"))}</div>`), // Insert before element
            () => element.insertAdjacentHTML('afterend', `<div>${this.mutateString(this.getRandomFuzzValue("string"))}</div>`), // Insert after element
            () => element.appendChild(document.createElement('script')).textContent = this.getRandomFuzzValue("script"), // Inject scripts
            () => {
                const iframe = document.createElement('iframe');
                iframe.srcdoc = this.getRandomFuzzValue("html");
                element.appendChild(iframe); // Inject iframes
            }
        ];
        for (const op of structuralOperations) {
            try {
                op();
                await this.throttle();
            } catch (error) {}
        }
    }

    async fuzzNestedElements(element, depth) {
        const children = element.children;
        for (let child of children) {
            await this.fuzzDOMElement(child, depth + 1);
        }
    }

    async applyTransformations(element) {
        const transformations = [
            () => element.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`,
            () => element.style.transform = `scale(${Math.random() + 0.5})`,
            () => element.style.transform = `translate(${Math.floor(Math.random() * 100)}px, ${Math.floor(Math.random() * 100)}px)`,
            () => element.style.transform = `skew(${Math.floor(Math.random() * 45)}deg, ${Math.floor(Math.random() * 45)}deg)`,
            () => element.style.transform = `rotateX(${Math.floor(Math.random() * 360)}deg) rotateY(${Math.floor(Math.random() * 360)}deg)`,
            () => element.style.transform = `perspective(${Math.floor(Math.random() * 1000)}px) rotate3d(${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.floor(Math.random() * 360)}deg)`,
            () => element.style.transform = `scaleX(${Math.random() * 2}) scaleY(${Math.random() * 2})`,
            () => element.style.transform = `matrix(${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.random() * 100}, ${Math.random() * 100})`,
            () => element.style.transform = `translateZ(${Math.random() * 200}px)` // New transformation
        ];
        for (const transform of transformations) {
            try {
                transform();
                await this.throttle();
            } catch (error) {}
        }
    }

    async injectDynamicScripts(element) {
        const scripts = [
            "alert('Fuzzing!');",
            "console.log('Fuzzing test');",
            "document.body.style.backgroundColor = 'red';",
            "document.body.innerHTML += '<div>Injected</div>';",
            "document.title = 'Fuzzing Test';",
            "setTimeout(() => { document.body.innerHTML = ''; }, 1000);",
            "document.body.contentEditable = 'true';",
            "document.designMode = 'on';",
            "navigator.clipboard.writeText('Fuzzing!');"
        ];
        const script = document.createElement('script');
        script.textContent = scripts[Math.floor(Math.random() * scripts.length)];
        document.body.appendChild(script);
        await this.throttle();
    }

    getRandomStyleValue(style) {
        switch (style) {
            case 'color':
            case 'backgroundColor':
            case 'borderColor':
                return this.getRandomColor();
            case 'border':
                return `${Math.floor(Math.random() * 10)}px solid ${this.getRandomColor()}`;
            case 'width':
            case 'height':
            case 'fontSize':
            case 'margin':
            case 'padding':
            case 'top':
            case 'left':
                return `${Math.floor(Math.random() * 200)}px`;
            case 'opacity':
                return Math.random().toString();
            case 'display':
                return ['block', 'inline', 'flex', 'grid', 'none'][Math.floor(Math.random() * 5)];
            case 'position':
                return ['static', 'relative', 'absolute', 'fixed', 'sticky'][Math.floor(Math.random() * 5)];
            case 'flex':
                return `${Math.random() * 10}`;
            case 'grid':
                return `repeat(${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 50)}px)`;
            case 'boxShadow':
                return `${Math.floor(Math.random() * 10)}px ${Math.floor(Math.random() * 10)}px ${Math.floor(Math.random() * 20)}px ${this.getRandomColor()}`;
            case 'borderRadius':
                return `${Math.floor(Math.random() * 50)}%`;
            case 'clipPath':
                return `circle(${Math.floor(Math.random() * 50)}%)`;
            case 'filter':
                return `blur(${Math.floor(Math.random() * 10)}px)`;
            case 'backdropFilter':
                return `contrast(${Math.random() * 200}%)`;
            case 'animation':
                return `spin ${Math.floor(Math.random() * 5)}s infinite linear`;
            case 'transition':
                return `all ${Math.floor(Math.random() * 3)}s ease`;
            case 'cursor':
                return ['pointer', 'crosshair', 'text', 'wait', 'help'][Math.floor(Math.random() * 5)];
            case 'outline':
                return `${Math.floor(Math.random() * 5)}px solid ${this.getRandomColor()}`;
            case 'visibility':
                return ['visible', 'hidden', 'collapse'][Math.floor(Math.random() * 3)];
            default:
                return '';
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    getRandomFuzzValue(type) {
        const dict = this.dictionaries[type] || [];
        return dict.length > 0 ? dict[Math.floor(Math.random() * dict.length)] : "";
    }

    mutateString(str) {
        const mutations = [
            s => s.split('').reverse().join(''), // Reverse string
            s => s.toUpperCase(), // Uppercase
            s => s.toLowerCase(), // Lowercase
            s => s.replace(/[aeiou]/g, ''), // Remove vowels
            s => s.replace(/\s/g, ''), // Remove spaces
            s => s.replace(/[^a-zA-Z0-9]/g, ''), // Remove special characters
            s => `${s}${Math.random().toString(36).substring(2, 7)}`, // Append random string
            s => s.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join(''), // Shift characters
            s => this.shuffleString(s), // Shuffle characters
            s => this.randomCase(s), // Random case
            s => this.invertCase(s), // Invert case
            s => this.randomInsert(s), // Randomly insert characters
            s => this.randomDelete(s), // Randomly delete characters
            s => this.leetSpeak(s) // Convert to leet speak
        ];
        return mutations[Math.floor(Math.random() * mutations.length)](str);
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    randomCase(str) {
        return str.split('').map(c => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase())).join('');
    }

    invertCase(str) {
        return str.split('').map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');
    }

    randomInsert(str) {
        const pos = Math.floor(Math.random() * str.length);
        const char = String.fromCharCode(Math.floor(Math.random() * 94) + 33);
        return str.slice(0, pos) + char + str.slice(pos);
    }

    randomDelete(str) {
        const pos = Math.floor(Math.random() * str.length);
        return str.slice(0, pos) + str.slice(pos + 1);
    }

    leetSpeak(str) {
        const leetDict = { 'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7' };
        return str.split('').map(c => leetDict[c.toLowerCase()] || c).join('');
    }

    async throttle() {
        return new Promise(resolve => setTimeout(resolve, this.throttleTime));
    }

    async startDOMFuzzing() {
        for (const el of this.domElements) {
            if (el) {
                try {
                    await this.fuzzDOMElement(el);
                } catch (error) {}
            }
        }
    }
}

export { DOMFuzzer };
