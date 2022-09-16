// parser which creates a graph from in file with model for linear program

const fs = require("fs");
const nReadlines = require('n-readlines');
const Graph = require("../algorithms/structures/Graph");
const MersenneTwister = require('mersenne-twister');
let generator = new MersenneTwister();

function createGraphFromFileMatching(filePath, isDirected) {
    const graphLines = new nReadlines(filePath);
    let line;
    let lineString;
    let graphSize;
    let graph;
    let costLines = false;

    while (line = graphLines.next()) {
        lineString = line.toString('ascii');

        if (costLines) {
            let edge = lineString.split(' ');
            if (edge.length === 3) {
                // source destination cost
                let source = parseInt(edge[0]);
                let destination = parseInt(edge[1]);
                let cost = parseInt(edge[2]);

                // capacity is 0 (not applicable here)
                graph.addEdge(source, destination,  1, cost);
            }
        }

        if (lineString.startsWith("set N2")) { // first set of vertices
            // get last number
            let numbers = lineString.split(' ');
            graphSize = parseInt(numbers[numbers.length - 2]) + 1;
            graph = new Graph(graphSize, isDirected); // TODO find out which algorithm better
        }

        if (lineString.startsWith("param: cost")) { // costs of edges
            costLines = true;
        }
    }

    return graph;
}

/**
 * Function dumps graph to data file which can be used to solve with glpk solver (min cost flow).
 * @param fileName name of the file
 */
function dumpGraphToFileMinCostFlow(fileName, graph) {
    let content = "set N := ";
    for (let i = 0; i < graph.vNo; i++) {
        content += i + " ";
    }
    content += ";\n\n";

    content += "set A :=\n"
    graph.nodes.forEach(node => {
        node.adjacencyList.forEach(neighbour => {
            content += node.key + " " + neighbour.key + "\n";
        });
    });
    content += ";\n\n";

    content += "param: capacity := \n";
    graph.nodes.forEach(node => {
        node.adjacencyList.forEach(neighbour => {
            content += node.key + " " + neighbour.key + " " + neighbour.capacity + "\n";
        });
    });
    content += ";\n\n";

    content += "param: cost := \n";
    graph.nodes.forEach(node => {
        node.adjacencyList.forEach(neighbour => {
            content += node.key + " " + neighbour.key + " " + neighbour.cost + "\n";
        });
    });
    content += ";\n\n";

    content += "param: balance := \n";
    graph.nodes.forEach(node => {
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

function dumpGraphToFileMatching(fileName, graph) {
    let content = "set N1 := ";
    for (let i = 0; i < graph.vNo / 2; i++) {
        content += i + " ";
    }

    content += ";\n\n";
    content += "set N2 := ";

    for (let i = graph.vNo / 2; i < graph.vNo; i++) {
        content += i + " ";
    }

    content += ";\n\n";

    content += "param: cost := \n";
    // edges from the first set to the second set
    for (let i = 0; i < graph.vNo / 2; i++) {
        graph.nodes[i].adjacencyList.forEach(neighbour => {
            content += i + " " + neighbour.key + " " + neighbour.cost + "\n";
        });
    }

    content += ";\n\n";

    content += "end;"

    fs.writeFile(fileName + ".dat", content, err => {
        if (err) {
            console.log("Could not dump graph to file.")
        }
    });
}

// get time and cost of matching from output of glpk
function parseResultGLPK(outputPath) {
    const outputLines = new nReadlines(outputPath);
    let line;
    let lineString;
    let cost;
    let time;

    while (line = outputLines.next()) {
        lineString = line.toString('ascii');
        if (lineString.startsWith('Time used:')) {
            let timeArr = lineString.split(' ');
            time = timeArr[timeArr.length - 2];
        }

        if (lineString.startsWith('Cost:')) {
            let costArr = lineString.split(' ');
            cost = parseInt(costArr[1]);
        }
    }

    return {cost: cost, time: time};
}

function generateTestCases(size, instances) {
    let graph;
    for (let i = 0; i < instances; i++) {
        graph = new Graph(size, true);
        // add edges
        for (let i = 0; i < graph.vNo / 2; i++) {
           for (let j = graph.vNo / 2; j < graph.vNo; j++) {
               graph.addEdge(i, j, 0, getRandomInt(0, 10));
           }
        }
        dumpGraphToFileMatching("./test_instances/graph_" + size + "_" + i, graph);
    }
}

let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(generator.random() * (max - min + 1)) + min;
};

module.exports = {
    createGraphFromFileMatching,
    dumpGraphToFileMinCostFlow,
    dumpGraphToFileMatching,
    parseResultGLPK,
    generateTestCases
};
