/**
 * A queue implementation with constant time for retrieving elements.
 */
class Queue {
    /**
     * Main constructor. Sets the attributes and initializes array.
     */
    constructor() {
        this.first = 0;
        this.last = 0;
        this.elements = [];
    }

    /**
     * Function that pushes element to the rear of the queue.
     * @param element
     */
    push(element) {
        this.elements[this.last] = element;
        this.last++;
    }

    /**
     * Function that returns and deletes the front element from the queue.
     * @returns {null|Integer} front element from the queue, null if queue is empty
     */
    pop() {
        if (this.first <= this.last) {
            this.first++;
            return this.elements[this.first - 1];
        } else {
            return null;
        }
    }

    /**
     * Function that returns current size of the queue.
     * @returns {number} current size of this queue
     */
    size() {
        return this.last - this.first;
    }

    /**
     * Function that checks if queue is empty.
     * @returns {boolean} true if queue is empty, false otherwise
     */
    empty() {
        return this.size() === 0;
    }
}

module.exports = Queue;