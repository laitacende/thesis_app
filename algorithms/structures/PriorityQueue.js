const QueueNode = require("./QueueNode");
const AbstractPriorityQueue = require("./AbstractPriorityQueue");

/**
 * Class to represent minimum priority queue based on binary heap.
 */
class PriorityQueue extends AbstractPriorityQueue {
    // /**
    //  * Array of objects of class {@link QueueNode}. Indexing starts from 1.
    //  * @type {[QueueNode]}
    //  */
    // heap = [];
    //
    // /**
    //  * Maximum size of priority queue.
    //  */
    // maxSize;
    //
    // /**
    //  * Current heap size.
    //  */
    // heapSize;

    /**
     * Main constructor. Initializes heap.
     *
     * @param size maximum size of priority queue
     */
    constructor(size) {
        super(size);
        for (let i = 1; i <= this.maxSize; i++) {
            this.heap.push(new QueueNode(0, Number.MAX_VALUE));
        }
    }

    // /**
    //  * Function that returns first element in priority queue.
    //  * @returns {QueueNode} first node in queue
    //  */
    // top() {
    //     return this.heap[1];
    // }
    //
    // /**
    //  * Function that checks if heap is empty.
    //  * @returns {boolean} true if heap is empty, false otherwise
    //  */
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
        while (i > 1 && this.heap[this.parent(i)].priority > priority) {
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
        for (let i = 1; i < this.heapSize; i++) {
            if (this.heap[i].key === key && newPriority < this.heap[i].priority) {
                this.heap[i].priority = newPriority;
                while (i > 1 && this.heap[this.parent(i)].priority > this.heap[i].priority) {
                    this.swap(i, this.parent(i));
                    i = this.parent(i);
                }
            }
        }
    }


    /**
     * Function that returns and deletes the top value from priority queue.
     *
     * @returns {QueueNode} top node in priority queue (minimum)
     */
    extractMin() {
        if (this.heapSize <= 0) {
            return new QueueNode(0, 0);
        }

        let min = this.heap[1];
        this.heap[1] = this.heap[this.heapSize];
        this.heapSize--;
        this.heapify(1);
        return min;
    }

    /**
     * Function that modifies heap to satisfy heap's properties (down-heapify).
     *
     * @param i index of node from which heapify will be performed (1 to process the whole heap)
     */
    heapify(i) {
        let smallest = i;
        if (this.left(i) <= this.heapSize && this.heap[smallest].priority > this.heap[this.left(i)].priority) {
            smallest = this.left(i);
        }

        if (this.right(i) <= this.heapSize && this.heap[smallest].priority > this.heap[this.right(i)].priority) {
            smallest = this.right(i);
        }

        if (i !== smallest) {
            this.swap(i, smallest);
            this.heapify(smallest);
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

    // /**
    //  * Function to swap node at index i with node at index j.
    //  * @param i first index
    //  * @param j second index
    //  */
    // swap(i, j) {
    //     let tmp = this.heap[i];
    //     this.heap[i] = this.heap[j];
    //     this.heap[j] = tmp;
    // }
}


module.exports = PriorityQueue;