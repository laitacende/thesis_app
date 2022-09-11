class CircularList {
    buckets = [];
    length;
    noOfEmpty;
    currentBucket;

    constructor(maxCost) {
        this.buckets = [];
        for (let i = 0; i <= maxCost; i++) {
            this.buckets.push(new Bucket(i));
        }
        this.length = maxCost + 1;
        this.noOfEmpty = this.length;
        this.currentBucket = 0;
    }

    extract() {
        let tmp = this.buckets[this.currentBucket].pop();
        // check if now bucket is empty
        if (this.buckets[this.currentBucket].isEmpty()) {
            this.noOfEmpty++;
        }
        return tmp;
    }

    nextNotEmptyBucket() {
        //console.log(this.buckets[this.currentBucket].isEmpty(), " curr", this.currentBucket);
        while (this.buckets[this.currentBucket].isEmpty()) {
            this.currentBucket = (this.currentBucket + 1) % this.length;
        }
    }

    // node is a key (int)
    addToBucket(bucketId, node) {
      //  console.log("adding node ", node, " to bucket ", bucketId)
        // check if bucket was previously empty
        //console.log("bid ", bucketId)
        if (this.buckets[bucketId].isEmpty()) {
            this.noOfEmpty--;
        }
        this.buckets[bucketId].add(node);
      //  console.log("cuuu ", this.currentBucket)
    }

    deleteFromBucket(bucketId, node) {
        this.buckets[bucketId].deleteFromBucket(node);
        if (this.buckets[bucketId].isEmpty()) {
            this.noOfEmpty++;
        }
    }

    isEmptyBucket() {
        return this.buckets[this.currentBucket].isEmpty();
    }

    getCurrentId() {
        return this.currentBucket;
    }

    ifAllEmpty() {
        return this.noOfEmpty === this.length;
    }
}

class Bucket {
    id;
    nodes;
    constructor(id) {
        this.id = id;
        this.nodes = new Set();
    }

    add(node) {
        this.nodes.add(node);
    }

    pop() {
        if (!this.isEmpty()) {
            let [tmp] = this.nodes;
            this.nodes.delete(tmp);
            return tmp;
        }
        return null;
    }

    deleteFromBucket(node) {
        this.nodes.delete(node);
    }

    isEmpty() {
       // console.log("size ", this.nodes.size);
        return this.nodes.size === 0;
    }
}

module.exports = CircularList;