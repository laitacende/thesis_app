/**
 * A stack implementation based on array.
 */
class Stack {
    /**
     * Main constructor. Sets the attributes.
     */
    constructor() {
        this.last = -1;
        this.elements = [];
    }

    /**
     * Function that adds element ot the top of the stack.
     * @param element element to be added
     */
    push(element) {
        this.last++;
        this.elements[this.last] = element;
    }

    /**
     * Function that returns and deletes the top element of the stack.
     * @returns {Integer} top element of the stack
     */
    pop() {
        this.last--;
        return this.elements[this.last + 1];
    }

    /**
     * Function which return the size of the stack.
     * @returns {number} size of this stack
     */
    size() {
        return this.last;
    }

    /**
     * Function that checks if this stack is empty.
     * @returns {boolean} true if stack is empty, false otherwise
     */
    empty() {
        return this.size() === -1;
    }

    /**
     * Function that returns the top element of this stack.
     * @returns {Integer} top element of the stack
     */
    peek() {
        return this.elements[this.last];
    }
}

module.exports = Stack;