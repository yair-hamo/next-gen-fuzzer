import { dictionaries } from './dictionaries.js';

class DOMFuzzer {
    constructor(domElements) {
        this.dictionaries = dictionaries;
        this.domElements = domElements;
        this.maxDepth = 15; // Increased recursive depth
        this.throttleTime = 5; // Decreased time between operations
    }

    async startDOMFuzzing() {
        for (const el of this.domElements) {
            if (el) {
                try {
                    await this.fuzzDOMElement(el);
                } catch (error) {
                    console.error('Error during DOM fuzzing:', error);
                }
            }
        }
    }

    async fuzzDOMElement(element, depth = 0) {
        if (depth > this.maxDepth) return;

        // Randomly set attributes with mutation-based fuzzing
        for (let i = 0; i < 50; i++) {
            try {
                const randomAttr = `data-fuzz-${Math.random().toString(36).substring(2, 7)}`;
                element.setAttribute(randomAttr, this.getRandomFuzzValue("string"));
                element.setAttribute(randomAttr, this.mutateString(element.getAttribute(randomAttr)));
                await this.throttle();
            } catch (error) {
                console.error('Error setting attribute:', error);
            }
        }

        // Randomly modify styles
        const styles = [
            'color', 'backgroundColor', 'border', 'width', 'height', 'fontSize',
            'margin', 'padding', 'opacity', 'display', 'position', 'top', 'left',
            'transform', 'zIndex', 'visibility', 'float', 'clear', 'overflow', 'cursor'
        ];
        for (const style of styles) {
            try {
                element.style[style] = this.getRandomStyleValue(style);
                await this.throttle();
            } catch (error) {
                console.error('Error modifying style:', error);
            }
        }

        // Trigger various events
        const events = [
            'click', 'mouseover', 'mouseout', 'focus', 'blur', 'keydown',
            'keyup', 'change', 'input', 'dblclick', 'contextmenu', 'wheel',
            'submit', 'reset', 'drag', 'drop', 'dragstart', 'dragend', 'dragover'
        ];
        for (const event of events) {
            try {
                const evt = new Event(event, { bubbles: true, cancelable: true });
                element.dispatchEvent(evt);
                await this.throttle();
            } catch (error) {
                console.error('Error triggering event:', error);
            }
        }

        // Modify innerHTML and textContent
        try {
            element.innerHTML = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
            element.textContent = this.mutateString(this.getRandomFuzzValue("string"));
            await this.throttle();
        } catch (error) {
            console.error('Error modifying innerHTML/textContent:', error);
        }

        // Modify value if it's an input element
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            try {
                element.value = this.mutateString(this.getRandomFuzzValue("string"));
                await this.throttle();
            } catch (error) {
                console.error('Error modifying value:', error);
            }
        }

        // Modify attributes
        this.modifyAttributes(element);

        // Handle nested elements
        this.fuzzNestedElements(element, depth);

        // Apply transformations
        this.applyTransformations(element);

        // Add structural fuzzing
        this.addStructuralFuzzing(element);
    }

    async modifyAttributes(element) {
        const attributes = ['title', 'alt', 'placeholder', 'src', 'href', 'class', 'id', 'name', 'role', 'aria-label', 'data-*'];
        for (const attr of attributes) {
            try {
                element.setAttribute(attr, this.mutateString(this.getRandomFuzzValue("string")));
                await this.throttle();
            } catch (error) {
                console.error('Error modifying attribute:', error);
            }
        }
    }

    async fuzzNestedElements(element, depth) {
        const nestedElements = element.querySelectorAll('*');
        for (const nestedElement of nestedElements) {
            try {
                await this.fuzzDOMElement(nestedElement, depth + 1);
                await this.throttle();
            } catch (error) {
                console.error('Error fuzzing nested element:', error);
            }
        }
    }

    applyTransformations(element) {
        const transformations = ['rotate', 'scale', 'translate', 'skew', 'translateX', 'translateY', 'scaleX', 'scaleY'];
        transformations.forEach(transformation => {
            try {
                element.style.transform += `${transformation}(${Math.random() * 360}deg) `;
            } catch (error) {
                console.error('Error applying transformation:', error);
            }
        });
    }

    addStructuralFuzzing(element) {
        const structuralOperations = [
            () => element.appendChild(document.createElement('div')),
            () => element.removeChild(element.firstChild),
            () => element.insertBefore(document.createElement('span'), element.firstChild),
            () => element.replaceChild(document.createElement('p'), element.firstChild),
            () => element.innerHTML = `<div>${element.innerHTML}</div>`,
            () => element.innerHTML = element.innerHTML.replace(/(<([^>]+)>)/gi, "")
        ];
        structuralOperations.forEach(op => {
            try {
                op();
                this.throttle();
            } catch (error) {
                console.error('Error during structural fuzzing:', error);
            }
        });
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
            case 'cursor':
                return ['pointer', 'default', 'move', 'wait', 'crosshair'][Math.floor(Math.random() * 5)];
            case 'visibility':
                return ['visible', 'hidden'][Math.floor(Math.random() * 2)];
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
