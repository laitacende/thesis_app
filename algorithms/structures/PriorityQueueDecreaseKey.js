const QueueNode = require("./QueueNode");
const AbstractPriorityQueue = require("./AbstractPriorityQueue");

/**
 * Class to represent minimum priority queue based on binary heap with Map structure to
 * provide mapping between indexes in heap and keys of nodes.
 */
class PriorityQueueDecreaseKey extends AbstractPriorityQueue {
    // heap = [];
    // maxSize;
    // heapSize;
    // indexes;

    /**
     * Main constructor. Initializes heap and Map.
     * @param size maximum size of priority queue
     */
    constructor(size) {
       super(size);
        for (let i = 1; i <= this.maxSize; i++) {
            this.heap.push(new QueueNode(0, Number.MAX_VALUE));
        }
        this.indexes = new Map(); // map between keys in graph and position in heap array
    }

    // top() {
    //     return this.heap[1];
    // }
    //
    // empty() {
    //     return this.heapSize === 0;
    // }

    /**
     * Function that adds element to priority queue. Sets the positions in map.
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
        this.indexes.set(key, i);
    }

    /**
     * Function that decreases priority of node of given key.
     * Searching for particular node is done in O(1) by using mapping provided in Map.
     *
     * @param key key of node to be updated
     * @param newPriority new value of priority
     */
    changePriority(key, newPriority) {
        let heapIndex = this.indexes.get(key);
        if (newPriority < this.heap[heapIndex].priority) {
            this.heap[heapIndex].priority = newPriority;
            while (heapIndex > 1 && this.heap[this.parent(heapIndex)].priority > this.heap[heapIndex].priority) {
                this.swap(heapIndex, this.parent(heapIndex));
                heapIndex = this.parent(heapIndex);
            }
        }
    }

    /**
     * Function that returns and deletes the top value from priority queue and updates Map.
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
        this.indexes.delete(min);
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

    /**
     * Function to swap node at index i with node at index j. Changes positions in Map.
     * @param i first index
     * @param j second index
     */
    swap(i, j) {
        let tmp = this.heap[i];
        let tmpPos = this.indexes.get(i);
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
        this.indexes.set(i, this.indexes.get(j));
        this.indexes.set(j, tmpPos);
    }
}


module.exports = PriorityQueueDecreaseKey;