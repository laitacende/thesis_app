const QueueNode = require("./QueueNode");
const AbstractPriorityQueue = require("./AbstractPriorityQueue");

/**
 * Class to represent maximum priority queue based on binary heap.
 */
class PriorityQueueMax extends AbstractPriorityQueue {
    // heap = [];
    // maxSize;
    // heapSize;

    /**
     * Main constructor. Initializes heap.
     *
     * @param size maximum size of priority queue
     */
    constructor(size) {
       super(size);
        for (let i = 1; i <= this.maxSize; i++) {
            this.heap.push(new QueueNode(0, 0));
        }
    }

    // top() {
    //     return this.heap[1];
    // }
    //
    // empty() {
    //     return this.heapSize === 0;
    // }

    /**
     * Function that adds element to priority queue.
     *
     * @param key identifier of node to be added
     * @param priority priority of element to be added
     */
    insert(key, priority) {
        if (priority < 0 || this.heapSize === this.maxSize) {
            return;
        }
        this.heapSize++;
        let i = this.heapSize;
        while (i > 1 && this.heap[this.parent(i)].priority < priority) {
            this.heap[i] = this.heap[this.parent(i)];
            i = this.parent(i);
        }

        this.heap[i] = new QueueNode(key, priority);
    }

    /**
     * Function that decreases priority of node of given key.
     * Searching for particular node is done in O(n).
     *
     * @param key key of node to be updated
     * @param newPriority new value of priority
     */
    changePriority(key, newPriority) {
        for (let i = 1; i <= this.heapSize; i++) {
            if (this.heap[i].key === key && this.heap[i].priority < newPriority) {
                this.heap[i].priority = newPriority;
                while (i > 1 && this.heap[this.parent(i)].priority < this.heap[i].priority) {
                    this.swap(i, this.parent(i));
                    i = this.parent(i);
                }
                break;
            } else if (this.heap[i].key === key && this.heap[i].priority !== newPriority) {
                this.heap[i].priority = newPriority;
                this.heapify(i);
                break;
            }
        }
    }

    /**
     * Function that returns and deletes the top value from priority queue.
     *
     * @returns {QueueNode} top node in priority queue (maximum)
     */
    extractMax() {
        if (this.heapSize <= 0) {
            return new QueueNode(0, 0);
        }
        let max = this.heap[1];
        this.heap[1] = this.heap[this.heapSize];
        this.heapSize--;
        this.heapify(1);
        return max;
    }

    /**
     * Function that modifies heap to satisfy heap's properties (down-heapify).
     *
     * @param i index of node from which heapify will be performed (1 to process the whole heap)
     */
    heapify(i) {
        let largest = i;
        if (this.left(i) <= this.heapSize && this.heap[largest].priority < this.heap[this.left(i)].priority) {
            largest = this.left(i);
        }

        if (this.right(i) <= this.heapSize && this.heap[largest].priority < this.heap[this.right(i)].priority) {
            largest = this.right(i);
        }

        if (i !== largest) {
            this.swap(i, largest);
            this.heapify(largest);
        }
    }

    // parent(i) {
    //     return i >> 1;
    // }
    //
    // left(i) {
    //     return i << 1;
    // }
    //
    // right(i) {
    //     return -(~(i << 1));
    // }
    //
    // swap(i, j) {
    //     let tmp = this.heap[i];
    //     this.heap[i] = this.heap[j];
    //     this.heap[j] = tmp;
    // }
}

module.exports = PriorityQueueMax;