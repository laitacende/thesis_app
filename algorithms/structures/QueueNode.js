/**
 * Class that represents a node in queue used in {@link Queue}.
 */
class QueueNode {
    /**
     * Main constructor. Sets the attributes.
     * @param key key of node
     * @param priority priority of node
     */
    constructor(key, priority) {
        this.key = key;
        this.priority = priority;
    }
}

module.exports = QueueNode;