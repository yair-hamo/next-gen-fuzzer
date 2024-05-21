import { dictionaries } from './dictionaries.js';

class DOMFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.throttleTime = 1; // Reduced throttle time for faster operations
        this.raceConditionTime = 0.5; // More frequent race conditions
    }

    startDOMFuzzing() {
        for (const el of this.domElements) {
            if (el) {
                this.fuzzDOMElement(el);
            }
        }
    }

    fuzzDOMElement(element) {
        this.createRaceCondition(element);
    }

    createRaceCondition(element) {
        const operations = [
            () => this.modifyAttributes(element),
            () => this.modifyStyles(element),
            () => this.triggerEvents(element),
            () => this.modifyContent(element),
            () => this.structuralChanges(element),
            () => this.cloneAndRemove(element),
            () => this.addRandomChildren(element),
            () => this.addShadowDOM(element),
            () => this.animateElement(element),
            () => this.injectRandomCSS(),
            () => this.attachComplexEventListeners(element),
            () => this.addSVGManipulations(element),
            () => this.deepNestElements(element),
            () => this.setupMutationObserver(element)
        ];

        operations.forEach(op => {
            setInterval(() => {
                try {
                    op();
                } catch (error) {
                    console.error('Race condition error:', error);
                }
            }, this.raceConditionTime);
        });
    }

    async modifyAttributes(element) {
        const attributes = ['title', 'alt', 'placeholder', 'src', 'href', 'class', 'id', 'name', 'role', 'aria-label'];
        for (const attr of attributes) {
            element.setAttribute(attr, this.mutateString(this.getRandomFuzzValue("string")));
            await this.throttle();
        }
    }

    async modifyStyles(element) {
        const styles = ['color', 'backgroundColor', 'border', 'width', 'height', 'fontSize', 'margin', 'padding', 'opacity', 'display', 'position', 'top', 'left', 'transform', 'zIndex'];
        for (const style of styles) {
            element.style[style] = this.getRandomStyleValue(style);
            await this.throttle();
        }
    }

    async triggerEvents(element) {
        const events = ['click', 'mouseover', 'mouseout', 'focus', 'blur', 'keydown', 'keyup', 'change', 'input', 'dblclick', 'contextmenu', 'wheel', 'submit', 'reset'];
        for (const event of events) {
            const evt = new Event(event, { bubbles: true, cancelable: true });
            element.dispatchEvent(evt);
            await this.throttle();
        }
    }

    async modifyContent(element) {
        element.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
        await this.throttle();
        element.textContent = this.mutateString(this.getRandomFuzzValue("string"));
        await this.throttle();
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
        }
    }

    async structuralChanges(element) {
        const structuralOperations = [
            () => element.appendChild(document.createElement('div')),
            () => element.removeChild(element.firstChild),
            () => element.insertBefore(document.createElement('span'), element.firstChild),
            () => element.replaceChild(document.createElement('p'), element.firstChild),
            () => element.innerHTML = `<div>${element.innerHTML}</div>`,
            () => element.outerHTML = `<div>${element.outerHTML}</div>`,
            () => element.parentNode && element.parentNode.removeChild(element),
            () => document.body.appendChild(element),
            () => element.insertAdjacentHTML('beforebegin', '<div></div>'),
            () => element.insertAdjacentHTML('afterend', '<span></span>')
        ];
        for (const op of structuralOperations) {
            op();
            await this.throttle();
        }
    }

    async cloneAndRemove(element) {
        const clone = element.cloneNode(true);
        element.parentNode && element.parentNode.insertBefore(clone, element.nextSibling);
        await this.throttle();
        element.remove();
    }

    async addRandomChildren(element) {
        for (let i = 0; i < 5; i++) {
            const child = document.createElement('div');
            child.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            element.appendChild(child);
            await this.throttle();
        }
    }

    async addShadowDOM(element) {
        if (!element.shadowRoot) {
            const shadow = element.attachShadow({ mode: 'open' });
            shadow.innerHTML = `<div>${this.mutateString(this.getRandomFuzzValue("string"))}</div>`;
            await this.throttle();
        }
    }

    async animateElement(element) {
        const keyframes = [
            { transform: 'translate(0, 0)' },
            { transform: `translate(${Math.random() * 100}px, ${Math.random() * 100}px)` }
        ];
        const options = {
            duration: Math.random() * 1000,
            iterations: Infinity,
            direction: 'alternate'
        };
        element.animate(keyframes, options);
        await this.throttle();
    }

    async injectRandomCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .random-style-${Math.random().toString(36).substring(2, 7)} {
                color: ${this.getRandomColor()};
                background-color: ${this.getRandomColor()};
                border: ${Math.floor(Math.random() * 10)}px solid ${this.getRandomColor()};
                width: ${Math.floor(Math.random() * 100)}px;
                height: ${Math.floor(Math.random() * 100)}px;
            }
        `;
        document.head.appendChild(style);
        await this.throttle();
        document.head.removeChild(style);
    }

    async attachComplexEventListeners(element) {
        const eventTypes = ['click', 'dblclick', 'mouseover', 'mouseout'];
        const handler = () => {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            document.body.appendChild(newDiv);
            setTimeout(() => document.body.removeChild(newDiv), 500);
        };
        for (const eventType of eventTypes) {
            element.addEventListener(eventType, handler);
        }
        await this.throttle();
        for (const eventType of eventTypes) {
            element.removeEventListener(eventType, handler);
        }
    }

    async addSVGManipulations(element) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", "100");
        rect.setAttribute("height", "100");
        rect.setAttribute("fill", this.getRandomColor());
        svg.appendChild(rect);
        element.appendChild(svg);
        await this.throttle();
        element.removeChild(svg);
    }

    async deepNestElements(element) {
        let current = element;
        for (let i = 0; i < 10; i++) {
            const newDiv = document.createElement('div');
            newDiv.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            current.appendChild(newDiv);
            current = newDiv;
            await this.throttle();
        }
    }

    async setupMutationObserver(element) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const newDiv = document.createElement('div');
                    newDiv.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
                    element.appendChild(newDiv);
                }
            }
        });
        observer.observe(element, { childList: true, subtree: true });
        await this.throttle();
        observer.disconnect();
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
            s => `${s}${Math.random().toString(36).substring(2, 7)}` // Append random string
        ];
        return mutations[Math.floor(Math.random() * mutations.length)](str);
    }

    async throttle() {
        return new Promise(resolve => setTimeout(resolve, this.throttleTime));
    }
}

export { DOMFuzzer };
