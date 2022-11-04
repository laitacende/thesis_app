const Neighbour = require("./Neighbour");

/**
 * Class which represents a node in graph.
 */
class Node {
    /**
     * Map of neighbours (key is Integer, value is {@link Neighbour}).
     */
    adjacencyList;

    /**
     * Map of neighbours in residual graph (key is Integer, value is {@link Neighbour}).
     */
    adjacencyListResidual;

    /**
     * Key of this node.
     */
    key;

    /**
     * Distance of this node from a node (shortest path).
     */
    dist;

    /**
     * Identifier of previous node on the shortest path.
     */
    prev;

    /**
     * True if node was visited by an algorithm, false otherwise.
     */
    visited;

    /**
     * Balance of this node (min cost flow).
     */
    balance;

    /**
     * Label of this node (used in Hungarian algorithm).
     */
    label;

    /**
     * True if this node is saturated (matched), false otherwise.
     */
    saturated;

    /**
     * Counter how many times this node was examined in FIFO label correcting.
     */
    counter; // needed for fifo label correcting algorithm and detecting negative cycle

    /**
     * Counter how many times this node was used in matching. Used in relaxation algorithm.
     */
    assignmentNumber; // used in relaxation algorithm

    /**
     * 'Price' of the node, used in auction algorithm.
     */
    price; // needed in auction algorithm

    /**
     * 'Owner' of this node, used in auction algorithm.
     */
    owner; // needed in auction algorithm

    /**
     * Main constructor, initializes maps and sets attributes.
     * @param key key of this node
     */
    constructor(key) {
        this.key = key;
        this.adjacencyList = new Map();
        this.adjacencyListResidual = new Map();
        this.visited = false;
        this.saturated = false;
    }

    /**
     * Function adds neighbour to this node.
     * @param destination new neighbour
     * @param capacity capacity of the edge
     * @param cost cost of the edge
     */
    addNeighbour(destination, capacity, cost) {
        this.adjacencyList.set(destination, new Neighbour(destination, capacity, cost));
    }

    /**
     * Function that adds weight to the node's neighbour (edge with start in this node).
     * @param destination endpoint of the edge
     * @param added amount to be added
     */
    addWeight(destination, added) {
        this.adjacencyList.get(destination).cost += added;
    }

    /**
     * Function adds neighbour to this node in residual graph.
     * @param destination new neighbour
     * @param capacity capacity of the edge
     * @param cost cost of the edge
     */
    addNeighbourResidual(destination, capacity, cost) {
        this.adjacencyListResidual.set(destination, new Neighbour(destination, capacity, cost));
    }

    /**
     * Function that sets balance of this node.
     * @param balance balance to be set
     */
    setBalance(balance) {
        this.balance = balance;
    }
}

module.exports = Node;