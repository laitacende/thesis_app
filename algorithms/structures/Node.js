var Neighbour = require("./Neighbour");

/**
 * Class which represents a node in graph.
 * @param key is a unique key of that node (typically an integer)
 */
class Node {
    adjacencyList;
    adjacencyListResidual;
    key;
    dist;
    prev;
    visited;
    balance;
    label;
    saturated;
    counter; // needed for fifo label correcting algorithm and detecting negative cycle
    assignmentNumber; // used in relaxation algorithm
    price; // needed in auction algorithm
    owner; // needed in auction algorithm
    distRes;

    constructor(key) {
        this.key = key;
        this.adjacencyList = new Map();
        this.adjacencyListResidual = new Map();
        this.visited = false;
        this.saturated = false;
    }

    /**
     * Function adds neighbour to this node
     * @param destination new neighbour
     * @param capacity capacity of the edge
     * @param cost cost of the edge
     */
    addNeighbour(destination, capacity, cost) {
        this.adjacencyList.set(destination, new Neighbour(destination, capacity, cost));
    }

    addWeight(destination, added) {
        this.adjacencyList.get(destination).cost += added;
    }

    addNeighbourResidual(destination, capacity, cost) {
        this.adjacencyListResidual.set(destination, new Neighbour(destination, capacity, cost));
    }

    setBalance(balance) {
        this.balance = balance;
    }
}

module.exports = Node;