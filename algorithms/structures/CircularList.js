const Bucket = require("./Bucket");

/**
 * Class which represents circular list of buckets.
 */
class CircularList {
    /**
     * List of {@link Bucket} objects.
     * @type {[Bucket]}
     */
    buckets = [];

    /**
     * Length of the list.
     */
    length;

    /**
     * Number of empty buckets.
     */
    noOfEmpty;

    /**
     * Index of current bucket.
     */
    currentBucket;

    /**
     * Main constructor. Creates list of buckets and sets attributes of the class.
     * @param maxCost maximum weight of edges
     */
    constructor(maxCost) {
        this.buckets = [];
        for (let i = 0; i <= maxCost; i++) {
            this.buckets.push(new Bucket(i));
        }
        this.length = maxCost + 1;
        this.noOfEmpty = this.length;
        this.currentBucket = 0;
    }

    /**
     * Function that returns the first node from the current bucket.
     * @returns {Integer} key of the first node from the current bucket
     */
    extract() {
        let tmp = this.buckets[this.currentBucket].pop();
        // check if now bucket is empty
        if (this.buckets[this.currentBucket].isEmpty()) {
            this.noOfEmpty++;
        }
        return tmp;
    }

    /**
     * Function which goes to the next not empty bucket.
     */
    nextNotEmptyBucket() {
        while (this.buckets[this.currentBucket].isEmpty()) {
            this.currentBucket = (this.currentBucket + 1) % this.length;
        }
    }

    /**
     * Function adds node id to bucket of given id.
     * @param bucketId identifier of bucket where node's key is to be added
     * @param node key of node
     */
    // node is a key (int)
    addToBucket(bucketId, node) {
        // check if bucket was previously empty
        if (this.buckets[bucketId].isEmpty()) {
            this.noOfEmpty--;
        }
        this.buckets[bucketId].add(node);
    }

    /**
     * Function that deletes node's id from bucket.
     * @param bucketId identifier of bucket from which node is to be deleted
     * @param node key of node
     */
    deleteFromBucket(bucketId, node) {
        this.buckets[bucketId].deleteFromBucket(node);
        if (this.buckets[bucketId].isEmpty()) {
            this.noOfEmpty++;
        }
    }

    /**
     * Function that returns if current bucket is empty.
     * @returns {boolean} true if current bucket is empty, false otherwise
     */
    isEmptyBucket() {
        return this.buckets[this.currentBucket].isEmpty();
    }

    /**
     * Function that returns id of the current bucket.
     * @returns {Integer} identifier of the current bucket
     */
    getCurrentId() {
        return this.currentBucket;
    }

    /**
     * Function that returns if all buckets are empty.
     * @returns {boolean} true if all buckets are empty, false otherwise
     */
    ifAllEmpty() {
        return this.noOfEmpty === this.length;
    }
}

module.exports = CircularList;