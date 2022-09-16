/**
 * Class that represents bucket, structure used in Dial's algorithm.
 */
class Bucket {
    /**
     * Identifier of the bucket.
     */
    id;

    /**
     * Set of nodes' identifiers which are in this bucket.
     */
    nodes;

    /**
     * Main constructor of bucket. Sets identifier and initializes set of nodes.
     * @param id identifier of bucket
     */
    constructor(id) {
        this.id = id;
        this.nodes = new Set();
    }

    /**
     * Function that adds node's identifier to bucket
     * @param node identifier of node
     */
    add(node) {
        this.nodes.add(node);
    }

    /**
     * Function that returns identifier of the top node from the bucket and deletes it.
     * @returns {null|Integer} identifier of the node, null if bucket is empty
     */
    pop() {
        if (!this.isEmpty()) {
            let [tmp] = this.nodes;
            this.nodes.delete(tmp);
            return tmp;
        }
        return null;
    }

    /**
     * Function that deletes given id (node) from bucket.
     * @param node identifier of node to be deleted
     */
    deleteFromBucket(node) {
        this.nodes.delete(node);
    }

    /**
     * Function that returns if this bucket is empty.
     * @returns {boolean} true if bucket is empty, false otherwise
     */
    isEmpty() {
        return this.nodes.size === 0;
    }
}

module.exports = Bucket;