class Stack {
    constructor() {
        this.last = -1;
        this.elements = [];
    }

    push(element) {
        this.last++;
        this.elements[this.last] = element;
    }

    pop() {
        this.last--;
        return this.elements[this.last + 1];
    }

    size() {
        return this.last;
    }

    empty() {
        return this.size() === -1;
    }

    peek() {
        return this.elements[this.last];
    }
}

module.exports = Stack;