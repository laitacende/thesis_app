const utilsTest = require('./utils');
const { performance } = require('perf_hooks');
const {cycleCancellingAlgorithm} = require("../algorithms/algorithms_implementations/cycleCancellingAlgorithm");
const {hungarianAlgorithm} = require("../algorithms/algorithms_implementations/hungarianAlgorithm");
const {relaxationAlgorithmReducedCosts, relaxationAlgorithm} = require("../algorithms/algorithms_implementations/relaxationAlgorithm");
const {successiveShortestPathAlgorithm} = require("../algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const {auctionAlgorithm} = require("../algorithms/algorithms_implementations/auctionAlgorithm");

let costs = new Array(5);
let time = new Array(5);
let startTime;
let M;

for (let i = 0; i < 5; i++) {
    costs[i] = 0; // costs is only for one graph at time - control if result is correct
    time[i] = 0;
}
// i <= 200, j < 10
for (let i = 10; i <= 100; i = i + 10) {
   // get graph from file
    for (let j = 0; j < 10; j++) {
        for (let i = 0; i < 5; i++) {
            costs[i] = 0;
        }
        let graphDirected = utilsTest.createGraphFromFileMatching("./test_instances/graph_" + i + "_" + j + ".dat", true);
        let graphUndirected = utilsTest.createGraphFromFileMatching("./test_instances/graph_" + i + "_" + j + ".dat", false);
        // TODO get cost obtained by glpsol
        // run algorithms

        startTime = performance.now()
        M = cycleCancellingAlgorithm(graphDirected);
        //console.log("cycle ", M);
        time[0] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[0] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now()
        M = hungarianAlgorithm(graphUndirected);
        //console.log("hungarian ", M);
        time[1] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[1] += graphUndirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now()
        M = relaxationAlgorithm(graphDirected);
        //console.log("relaxation ", M);
        time[2] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[2] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now()
        M = successiveShortestPathAlgorithm(graphDirected);
        //console.log("successive ", M);
        time[3] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[3] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        startTime = performance.now()
        M = auctionAlgorithm(graphDirected);
        //console.log("successive ", M);
        time[4] += (performance.now() - startTime); // milliseconds
        M.forEach(pair => {
            costs[4] += graphDirected.nodes[pair.source].adjacencyList.get(pair.destination).cost;
        });

        // check the correctness of costs
        console.log("size ", i, " instance ", j);
        if (!(costs[0] === costs[1] && costs[1] === costs[2] && costs[2] === costs[3]
        && costs[3] === costs[4])) {
            console.log("!!!FAIL -- ", costs[0], " ", costs[1], " ", costs[2], " ", costs[3],
                " ", costs[4]);
        } else {
            console.log("CORRECT -- ", costs[0], " ", costs[1], " ", costs[2], " ", costs[3],
                " ", costs[4]);
        }
    }
}