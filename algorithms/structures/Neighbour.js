/**
 * Class is a node for adjacency list for graph.
 */
class Neighbour {
    key;
    capacity;
    flow;
    toTarget;
    cost;
    isReversed;

    constructor(key, capacity, cost, isReversed) {
        this.key = key;
        this.capacity = capacity;
        this.flow = 0;
        this.toTarget = true;
        this.cost = cost;
        this.isReversed = isReversed;
    }
}

module.exports = Neighbour;