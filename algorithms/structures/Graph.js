const Node = require("./Node");
const fs = require('fs');

class Graph {
    nodes;
    vNo; // number of vertices
    isDirected;

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
     * Function adds directed edge between source and destination
     * @param source start node
     * @param destination end node
     * @param capacity capacity of the edge
     */
    addEdge(source, destination, capacity, cost) {
        this.nodes[source].addNeighbour(destination, capacity, cost);
        if (!this.isDirected) {
            this.nodes[destination].addNeighbour(source, capacity, cost);
        }
    }

    addWeightToEdge(source, destination, added) {
        this.nodes[source].addWeight(destination, added);
        if (!this.isDirected) {
            this.nodes[destination].addWeight(source, added);
        }
    }

    setBalance(key, balance) {
        this.nodes[key].setBalance(balance);
    }

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

    getCopyWithPositiveCosts() {
        // find minimum cost (costs are 0 or negative)
        let min = 0;
        this.nodes.forEach(node => {
           node.adjacencyList.forEach(neighbour => {
               if (neighbour.cost < min) {
                   min = neighbour.cost;
               }
           });
        });
        min = -min;
        let copy = new Graph(this.vNo, this.isDirected);

        this.nodes.forEach(node => {
            copy.nodes[node.key].setBalance(node.balance);
            node.adjacencyList.forEach(neighbour => {
                copy.addEdge(node.key, neighbour.key, neighbour.capacity, min + neighbour.cost);
            });
        });
        return copy;
    }

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

    printFlow() {
        console.log("i  j  flow");
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.flow);
            });
        });
    }

    printGraph() {
        console.log("key i   key j  capacity  cost")
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.capacity + " " + neighbour.cost);
            });
        });
    }

    printGraphResidual() {
        console.log("key i   key j  capacity  cost")
        this.nodes.forEach(node => {
            node.adjacencyListResidual.forEach(neighbour => {
                console.log(node.key + " " + neighbour.key + " " + neighbour.capacity + " " + neighbour.cost);
            });
        });
    }

    printLabels() {
        this.nodes.forEach(node => {
            console.log(node.key + " " + node.label + " " + node.saturated);
        });
    }

    printDistances() {
        this.nodes.forEach(node => {
           console.log(node.key + " " + node.dist);
        });
    }

    /**
     * Function dumps graph to data file which can be used to solve with glpk solver (min cost flow)
     * @param fileName name of the file
     */
    dumpToFile(fileName) {
        let content = "set N := ";
        for (let i = 0; i < this.vNo; i++) {
            content += i + " ";
        }
        content += ";\n\n";

        content += "set A :=\n"
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                content += node.key + " " + neighbour.key + "\n";
            });
        });
        content += ";\n\n";

        content += "param: capacity := \n";
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                content += node.key + " " + neighbour.key + " " + neighbour.capacity + "\n";
            });
        });
        content += ";\n\n";

        content += "param: cost := \n";
        this.nodes.forEach(node => {
            node.adjacencyList.forEach(neighbour => {
                content += node.key + " " + neighbour.key + " " + neighbour.cost + "\n";
            });
        });
        content += ";\n\n";

        content += "param: balance := \n";
        this.nodes.forEach(node => {
            content += node.key + " " + node.balance + "\n";
        });
        content += ";\n\n";

        content += "end;"

        fs.writeFile(fileName + ".dat", content, err => {
            if (err) {
                console.log("Could not dump graph to file.")
            }
        });
    }

}

module.exports = Graph;
