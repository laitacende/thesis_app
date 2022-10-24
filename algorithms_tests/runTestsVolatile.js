/**
 * Tests with random graphs. The generated graphs aren't saved in files.
 */

const fs = require("fs");
const Graph = require("../algorithms/structures/Graph");
const utilsTest = require('./utils');
const {auctionAlgorithm} = require("../algorithms/algorithms_implementations/auctionAlgorithm");
const {performance} = require("perf_hooks");

let size = 100000000;
let instances = 10;
let step = 50;
let graph;
let startTime;
let time;
let M;

let stream = fs.createWriteStream("./output/results_etap_3.txt", {flags:'a'});

for (let j = 2; j <= size; j = j + step) {
    time = 0;
    for (let i = 0; i < instances; i++) {
        graph = new Graph(j, true);
        // add edges
        for (let i = 0; i < graph.vNo / 2; i++) {
            for (let j = graph.vNo / 2; j < graph.vNo; j++) {
                graph.addEdge(i, j, 0, utilsTest.getRandomInt(0, 10));
            }
        }

        startTime = performance.now();
        M = auctionAlgorithm(graph);
        time += (performance.now() - startTime); // milliseconds
    }

    stream.write( j + " " + (time / instances).toString() +  "\n");
}

stream.end();