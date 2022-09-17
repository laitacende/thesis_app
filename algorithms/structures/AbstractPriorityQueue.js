/**
 * Base class of priority queue.
 */
class AbstractPriorityQueue {
    /**
     * Array of objects of class {@link QueueNode}. Indexing starts from 1.
     * @type {[QueueNode]}
     */
    heap = [];

    /**
     * Maximum size of priority queue.
     */
    maxSize;

    /**
     * Current heap size.
     */
    heapSize;

    /**
     * Main constructor. Sets the attributes.
     * @param size maximum size of priority queue
     */
    constructor(size) {
        this.maxSize = size;
        this.heapSize = 0;
    }

    /**
     * Function that returns first element in priority queue.
     * @returns {QueueNode} first node in queue
     */
    top() {
        return this.heap[1];
    }

    /**
     * Function that checks if heap is empty.
     * @returns {boolean} true if heap is empty, false otherwise
     */
    empty() {
        return this.heapSize === 0;
    }

    /**
     * Function that returns index of parent of node at given index.
     * @param i index of node
     * @returns {Integer} index of parent
     */
    parent(i) {
        return i >> 1;
    }

    /**
     * Function that returns index of left child of node at given index.
     * @param i index of node
     * @returns {Integer} index of left child
     */
    left(i) {
        return i << 1;
    }

    /**
     * Function that returns index of right child of node at given index.
     * @param i index of node
     * @returns {Integer} index of right child
     */
    right(i) {
        return -(~(i << 1));
    }

    /**
     * Function that adds a new node to priority queue. Implemented in derived classes.
     * @param key index of node
     * @param priority priority of node to be added
     */
    insert(key, priority) {

    }

    /**
     * Function that changes priority of given node. Implemented in derived classes.
     * @param key index of node
     * @param newPriority new value of priority
     */
    changePriority(key, newPriority) {

    }

    /**
     * Function that modifies heap to satisfy heap's properties (down-heapify). Implemented in derived classes.
     * @param i index of node from which heapify will be performed (1 to process the whole heap)
     */
    heapify(i) {

    }

    /**
     * Function to swap node at index i with node at index j.
     * @param i first index
     * @param j second index
     */
    swap(i, j) {
        let tmp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
    }
}

module.exports = AbstractPriorityQueue;