const QueueNode = require("./QueueNode");

class PriorityQueue {
    heap = [];
    maxSize;
    heapSize;

    constructor(size) {
        this.maxSize = size;
        this.heapSize = 0;
        for (let i = 1; i <= this.maxSize; i++) {
            this.heap.push(new QueueNode(0, Number.MAX_VALUE));
        }
    }

    top() {
        return this.heap[0];
    }

    empty() {
        return this.heapSize === 0;
    }

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

    parent(i) {
        return i >> 1;
    }

    left(i) {
        return i << 1;
    }

    right(i) {
        return -(~(i << 1));
    }

    swap(i, j) {
        let tmp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
    }
}


module.exports = PriorityQueue;