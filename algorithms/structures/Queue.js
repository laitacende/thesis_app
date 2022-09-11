/**
 * A queue implementation with constant time for retrieving elements.
 */
class Queue {
    constructor() {
        this.first = 0;
        this.last = 0;
        this.elements = [];
    }

    push(element) {
        this.elements[this.last] = element;
        this.last++;
    }

    pop() {
        if (this.first <= this.last) {
            this.first++;
            return this.elements[this.first - 1];
        } else {
            return null;
        }
    }

    size() {
        return this.last - this.first;
    }

    empty() {
        return this.size() === 0;
    }
}

module.exports = Queue;