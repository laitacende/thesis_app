const fs = require("fs");
const utilsTest = require('./utils');
const { performance } = require('perf_hooks');
const {cycleCancellingAlgorithm} = require("../algorithms/algorithms_implementations/cycleCancellingAlgorithm");
const {hungarianAlgorithm} = require("../algorithms/algorithms_implementations/hungarianAlgorithm");
const {relaxationAlgorithmReducedCosts, relaxationAlgorithm} = require("../algorithms/algorithms_implementations/relaxationAlgorithm");
const {successiveShortestPathAlgorithm} = require("../algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const {auctionAlgorithm, auctionAlgorithmPriorityQueue, auctionAlgorithmPriorityQueueDecreaseKey} = require("../algorithms/algorithms_implementations/auctionAlgorithm");
const {parseResultGLPK} = require("./utils");

/**
 * Script to perform tests of algorithms on previously created test instances.
 * Checks if all costs obtained by the algorithms are equal and prints
 * information to stdout.
 */

/**
 * Number of algorithms to be tested.
 * @type {number}
 */
let size = 7;

/**
 * Array to store costs of matchings obtained by the algorithms.
 * @type {[Integer]}
 */
let costs = new Array(size);

/**
 * Array of times of execution of the algorithms.
 * @type {[number]}
 */
let time = new Array(size);

/**
 * Time when algorithm starts the execution.
 */
let startTime;

/**
 * Matching obtained by the algorithm.
 */
let M;

for (let i = 0; i < size; i++) {
    costs[i] = 0; // costs is only for one graph at time - control if result is correct
    time[i] = 0;
}

let timeGLPK = 0;
let costGLPK = 0;

let stream = fs.createWriteStream("./output/results.txt", {flags:'a'});

for (let i = 550; i <= 1000; i = i + 50) {
   // get graph from file
    for (let i = 0; i < size; i++) {
        time[i] = 0;
    }
    timeGLPK = 0;

    for (let j = 0; j < 10; j++) {
        for (let i = 0; i < size; i++) {
            costs[i] = 0;
        }
        let graphDirected = utilsTest.createGraphFromFileMatching("./test_instances_large/graph_" + i + "_" + j + ".dat", true);
        let graphUndirected = utilsTest.createGraphFromFileMatching("./test_instances_large/graph_" + i + "_" + j + ".dat", false);

        // get cost obtained by glpsol
        let result = parseResultGLPK("./glpsol_output/graph_" + i + "_" + j + ".dat.output");
        costGLPK = result.cost;
        timeGLPK += Number.parseFloat(result.time) * 1000;

        // run algorithms

        startTime = performance.now();
        M = cycleCancellingAlgorithm(graphDirected);
        //console.log("cycle ", M);
        time[0] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[0] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = hungarianAlgorithm(graphUndirected);
        //console.log("hungarian ", M);
        time[1] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[1] += graphUndirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = relaxationAlgorithm(graphDirected);
        //console.log("relaxation ", M);
        time[2] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[2] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = successiveShortestPathAlgorithm(graphDirected);
        //console.log("successive ", M);
        time[3] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[3] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = auctionAlgorithm(graphDirected);
        //console.log("auction ", M);
        time[4] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[4] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = auctionAlgorithmPriorityQueue(graphDirected);
        //console.log("auction ", M);
        time[5] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[5] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now();
        M = auctionAlgorithmPriorityQueueDecreaseKey(graphDirected);
        //console.log("auction  priority decrease", M);
        time[6] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[6] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        // check the correctness of costs
        console.log("size ", i, " instance ", j);
        if (!(costGLPK === costs[0] && costs[0] === costs[1] && costs[1] === costs[2] && costs[2] === costs[3]
        && costs[3] === costs[4] && costs[4] === costs[5] && costs[5] === costs[6])) {
            console.log("!!!FAIL -- ", costGLPK, " ", costs[0], " ", costs[1], " ", costs[2], " ", costs[3],
                " ", costs[4], " ", costs[5], " ", costs[6]);
        } else {
            console.log("CORRECT -- ", costGLPK, " ", costs[0], " ", costs[1], " ", costs[2], " ", costs[3],
                " ", costs[4], " ", costs[5], " ", costs[6]);
        }
    }

    let line = "";
    for (let k = 0; k < size; k++) {
        if (k !== size - 1) {
            line += (time[k] / 10).toString() + " ";
        } else {
            line += (time[k] / 10).toString();
        }
    }
   // fs.writeFileSync("./output/results.txt", (timeGLPK / 10).toString() + " " + line);
    stream.write( i + " " + (timeGLPK / 10).toString() + " " + line + "\n");
}

stream.end();