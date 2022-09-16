/**
 * Class used to represent neighbour in adjacency list of {@link Graph}.
 */
class Neighbour {
    /**
     * Key of node (the other endpoint of edge).
     */
    key;

    /**
     * Capacity of the edge.
     */
    capacity;

    /**
     * Flow on this edge.
     */
    flow;

    /**
     * True if this edge leads to target, false otherwise. Used in Dinic's algorithm.
     */
    toTarget;

    /**
     * Cost (weight) of this edge.
     */
    cost;

    /**
     * Main constructor. Sets the attributes.
     * @param key key of neighbour (same as key node in graph)
     * @param capacity capacity of this edge
     * @param cost cost of this edge
     */
    constructor(key, capacity, cost) {
        this.key = key;
        this.capacity = capacity;
        this.flow = 0;
        this.toTarget = true;
        this.cost = cost;
    }
}

module.exports = Neighbour;