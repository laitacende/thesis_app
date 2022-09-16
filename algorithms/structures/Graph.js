const Node = require("./Node");

/**
 * Class that represents a graph using adjacency list.
 */
class Graph {
    /**
     * Array of objects of class {@link Node}.
     */
    nodes;

    /**
     * Number of vertices.
     */
    vNo; // number of vertices

    /**
     * Variable to indicate if graph is directed (true) or undirected (false).
     */
    isDirected;

    /**
     * Main constructor. Initializes array of nodes and sets attributes.
     * @param vNo number of vertices
     * @param isDirected true if graph is directed, false otherwise
     */
    constructor(vNo, isDirected) {
        this.nodes = new Array(vNo);
        this.vNo = vNo;
        // initialize nodes
        for (let i = 0; i < vNo; i++) {
            this.nodes[i] = new Node(i);
        }
        this.isDirected = isDirected;
    }

    /**
     * Function adds edge between source and destination based on isDirected value
     * @param source start node
     * @param destination end node
     * @param capacity capacity of the edge
     * @param cost cost (weight) of the edge
     */
    addEdge(source, destination, capacity, cost) {
        this.nodes[source].addNeighbour(destination, capacity, cost);
        if (!this.isDirected) {
            this.nodes[destination].addNeighbour(source, capacity, cost);
        }
    }

    /**
     * Function which adds weight to given edge. Source and destination can be
     * interchanged when graph is undirected.
     * @param source start node
     * @param destination end node
     * @param added amount to be added to weight
     */
    addWeightToEdge(source, destination, added) {
        this.nodes[source].addWeight(destination, added);
        if (!this.isDirected) {
            this.nodes[destination].addWeight(source, added);
        }
    }

    /**
     * Function which sets balance of given node.
     * @param key identifier of node which balance is to be set
     * @param balance value of balance to be set
     */
    setBalance(key, balance) {
        this.nodes[key].setBalance(balance);
    }

    /**
     * Function that constructs residual network of graph. Assumes that current flow is 0.
     */
    constructResidual() {
        this.nodes.forEach(node => {
             node.adjacencyListResidual = new Map();
        });

        // add edges in graph and backward edges
        this.nodes.forEach(node => {
           // node.adjacencyListResidual = new Map();
            node.adjacencyList.forEach((neighbour, key) => {
                node.addNeighbourResidual(neighbour.key, neighbour.capacity, neighbour.cost, false);
                // backward edge
                this.nodes[neighbour.key].addNeighbourResidual(node.key, 0, -neighbour.cost, true);
            });
        });
    }

    /**
     * Function which creates an instance of this graph for max flow algorithms.
     * Adds source with identifier vNo and target with identifier vNo + 1.
     * Source is connected with all nodes with positive balances and
     * target is connected with all nodes with negative balances.
     *
     * @returns {Graph|null} new instance for max flow, null if balances aren't adding up to 0
     */
    getCopyForMaxFlow() {
        let copy = new Graph(this.vNo + 2, this.isDirected);
        let pos = 0;
        let neg = 0;
        // source is vNo + 1, target has the largest key
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                copy.addEdge(node.key, neighbour.key, neighbour.capacity, neighbour.cost);
            });

            if (node.balance > 0) {
                pos += node.balance;
                copy.addEdge(this.vNo, node.key, node.balance, 0);
            } else if (node.balance < 0) {
                neg += node.balance;
                copy.addEdge(node.key, this.vNo + 1, -node.balance, 0);
            }
        });

        if (pos + neg !== 0) {
            return null; // not feasible
        }

        return copy;
    }

    /**
     * Function that creates an instance of this graph but with negated costs (weight of edges).
     * @returns {Graph} graph with negated costs
     */
    getCopyWithOppositeCosts() {
        let copy = new Graph(this.vNo, this.isDirected);

        this.nodes.forEach(node => {
            copy.nodes[node.key].setBalance(node.balance);
            node.adjacencyList.forEach(neighbour => {
                copy.addEdge(node.key, neighbour.key, neighbour.capacity, -neighbour.cost);
            });
        });
        return copy;
    }

    /**
     * Function which creates an equality graph (containing only edges for which
     * label(i) + label(j) == cost(i, j) - tight edges).
     *
     * @returns {Graph} equality graph based ont this graph current state
     */
    getEqualityGraph() {
        let copy = new Graph(this.vNo, false);

        // add only edges where l(i) + l(j) == c(i, j) (tight edges)
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                if (node.label + this.nodes[neighbour.key].label === neighbour.cost) {
                    copy.addEdge(node.key, neighbour.key, neighbour.capacity, neighbour.cost);
                }
            });
        });
        return copy;
    }

    /**
     * Function which prints flow in form 'i j flow' to stdout.
     */
    printFlow() {
        console.log("i  j  flow");
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.flow);
            });
        });
    }


    /**
     * Function which prints graph in form 'i j capacity cost' to stdout.
     */
    printGraph() {
        console.log("key i   key j  capacity  cost")
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.capacity + " " + neighbour.cost);
            });
        });
    }

    /**
     * Function which prints residual graph in form 'i j capacity cost' to stdout.
     */
    printGraphResidual() {
        console.log("key i   key j  capacity  cost")
        this.nodes.forEach(node => {
            node.adjacencyListResidual.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.capacity + " " + neighbour.cost);
            });
        });
    }

    /**
     * Function which prints labels in form 'key label saturated' to stdout.
     */
    printLabels() {
        this.nodes.forEach(node => {
            console.log(node.key + " " + node.label + " " + node.saturated);
        });
    }

    /**
     * Function which prints node distances in form 'key distance' to stdout.
     */
    printDistances() {
        this.nodes.forEach(node => {
           console.log(node.key + " " + node.dist);
        });
    }
}

module.exports = Graph;
