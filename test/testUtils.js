const assert = require('assert');
const Graph = require("../algorithms/structures/Graph");
const utils = require("../algorithms/utils");
const hungarian_algorithm = require("../algorithms/algorithms_implementations/hungarianAlgorithm");
const spp = require("../algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const cc = require("../algorithms/algorithms_implementations/cycleCancellingAlgorithm");
const utilsTests = require("../algorithms_tests/utils");

// npm run test

// describe('Fifo Label Correcting', () => {
//     let g = new Graph(5, true);
//     g.addEdge(0, 1, 0, 6);
//     g.addEdge(0, 3, 0, 7);
//     g.addEdge(1, 3, 0, 8);
//     g.addEdge(1, 4, 0, -4);
//     g.addEdge(1, 2, 0, 5);
//     g.addEdge(2, 1, 0, -2);
//     g.addEdge(3, 4, 0, 9);
//     g.addEdge(3, 2, 0, -3);
//     g.addEdge(4, 2, 0, 7);
//     g.addEdge(4, 0, 0, 2);
//
//
//     it('Graph 1', () => {
//         assert.equal(utils.fifoLabelCorrecting(g, 0), true);
//         assert.equal(g.nodes[0].dist, 0);
//         assert.equal(g.nodes[1].dist, 2);
//         assert.equal(g.nodes[2].dist, 4);
//         assert.equal(g.nodes[3].dist, 7);
//         assert.equal(g.nodes[4].dist, -2);
//     });
//
// });


describe('Graph 1', () => {
    let g = new Graph(5, true);
    g.addEdge(0, 1, 1, 3);
    g.addEdge(0, 2, 1, 5);
    g.addEdge(1, 3, 1, 6);
    g.addEdge(1, 2, 1, 2);
    g.addEdge(2, 1, 1, 1);
    g.addEdge(2, 3, 1, 4);
    g.addEdge(2, 4, 1, 6);
    g.addEdge(3, 4, 1, 2);
    g.addEdge(4, 3, 1, 7);
    g.addEdge(4, 0, 0, 3);

    it('Dijkstra', () => {
        assert.equal(utils.dijkstraResidual(g, 0, 4), true);
        assert.equal(g.nodes[0].dist, 0);
        assert.equal(g.nodes[1].dist, 3);
        assert.equal(g.nodes[2].dist, 5);
        assert.equal(g.nodes[3].dist, 9);
        assert.equal(g.nodes[4].dist, 11);
    });


    it('Dial', () => {
        assert.equal(utils.dialResidual(g, 0, 4), true);
        assert.equal(g.nodes[0].dist, 0);
        assert.equal(g.nodes[1].dist, 3);
        assert.equal(g.nodes[2].dist, 5);
        assert.equal(g.nodes[3].dist, 9);
        assert.equal(g.nodes[4].dist, 11);
    });

});

describe('Graph 2', () => {
    let g = new Graph(9, true);
    g.addEdge(0, 1, 1, 10);
    g.addEdge(0, 2, 1, 15);
    g.addEdge(1, 3, 1, 12);
    g.addEdge(1, 4, 1, 15);
    g.addEdge(2, 5, 1, 10);
    g.addEdge(3, 4, 1, 1);
    g.addEdge(3, 5, 1, 2);
    g.addEdge(4, 5, 1, 5);

    it('Dijkstra', () => {
        assert.equal(utils.dijkstraResidual(g, 0, 4), true);
        assert.equal(g.nodes[0].dist, 0);
        assert.equal(g.nodes[1].dist, 10);
        assert.equal(g.nodes[2].dist, 15);
        assert.equal(g.nodes[3].dist, 22);
        assert.equal(g.nodes[4].dist, 23);
        assert.equal(g.nodes[5].dist, 24);
    });


    it('Dial', () => {
        assert.equal(utils.dialResidual(g, 0, 4), true);
        assert.equal(g.nodes[0].dist, 0);
        assert.equal(g.nodes[1].dist, 10);
        assert.equal(g.nodes[2].dist, 15);
        assert.equal(g.nodes[3].dist, 22);
        assert.equal(g.nodes[4].dist, 23);
        assert.equal(g.nodes[5].dist, 24);
    });

});

describe('GraphDump', () => {
    let g = new Graph(8, false);
    g.addEdge(0, 4, 1, 6);
    g.addEdge(0, 5, 1, 2);
    g.addEdge(0, 6, 1, 5);
    g.addEdge(0, 7, 1, 8);

    g.addEdge(1, 4, 1, 6);
    g.addEdge(1, 5, 1, 7);
    g.addEdge(1, 6, 1, 1);
    g.addEdge(1, 7, 1, 6);

    g.addEdge(2, 4, 1, 6);
    g.addEdge(2, 5, 1, 3);
    g.addEdge(2, 6, 1, 4);
    g.addEdge(2, 7, 1, 5);

    g.addEdge(3, 4, 1, 5);
    g.addEdge(3, 5, 1, 4);
    g.addEdge(3, 6, 1, 3);
    g.addEdge(3, 7, 1, 4);


    it('Matching', () => {
        // utilsTests.createGraphFromFileMatching("g1_bipartite.dat");
       // utilsTests.dumpGraphToFileMatching("g1_bipartite", g);
       // utilsTests.parseResultGLPK("g1_bipartite_output.txt");
        utilsTests.generateTestCases(6, 1, true);
    });

});
