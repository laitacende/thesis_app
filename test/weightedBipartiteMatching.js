const assert = require('assert');
const Graph = require("../algorithms/structures/Graph");
const hungarian_algorithm = require("../algorithms/algorithms_implementations/hungarianAlgorithm");
const spp = require("../algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const cc = require("../algorithms/algorithms_implementations/cycleCancellingAlgorithm");
const relax = require("../algorithms/algorithms_implementations/relaxationAlgorithm");
const auction = require("../algorithms/algorithms_implementations/auctionAlgorithm");

function isEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    Array.from(a).every(element => {
        if (!b.has(element)) {
            return false;
        }
    });
    return true;
}

describe('Graph 1', () => {
    let g = new Graph(6, false);
    g.addEdge(0, 3, 1, 1);
    g.addEdge(0, 4, 1, 6);
    g.addEdge(0, 5, 1, 0);
    g.addEdge(1, 3, 1, 0);
    g.addEdge(1, 4, 1, 8);
    g.addEdge(1, 5, 1, 6);
    g.addEdge(2, 3, 1, 4);
    g.addEdge(2, 4, 1, 0);
    g.addEdge(2, 5, 1, 1);

    let g2 = new Graph(6, true);
    g2.addEdge(0, 3, 1, 1);
    g2.addEdge(0, 4, 1, 6);
    g2.addEdge(0, 5, 1, 0);
    g2.addEdge(1, 3, 1, 0);
    g2.addEdge(1, 4, 1, 8);
    g2.addEdge(1, 5, 1, 6);
    g2.addEdge(2, 3, 1, 4);
    g2.addEdge(2, 4, 1, 0);
    g2.addEdge(2, 5, 1, 1);

    g2.setBalance(0, 1);
    g2.setBalance(1, 1);
    g2.setBalance(2, 1);
    g2.setBalance(3, -1);
    g2.setBalance(4, -1);
    g2.setBalance(5, -1);

    let M = new Set();
    M.add({source: 0, destination: 4});
    M.add({source: 1, destination: 5});
    M.add({source: 2, destination: 3});


    it('Hungarian', () => {
        assert.equal(isEqual(hungarian_algorithm.hungarianAlgorithm(g), M), true);
    });

    it('Relaxation', () => {
        assert.equal(isEqual(relax.relaxationAlgorithm(g2), M), true);
    });

    // it('Relaxation reduced cost', () => {
    //     assert.equal(isEqual(relax.relaxationAlgorithmReducedCosts(g2), M), true);
    // });

    it('Successive shortest path', () => {
        assert.equal(isEqual(spp.successiveShortestPathAlgorithm(g2), M), true);
    });

    // it('Successive shortest path dial', () => {
    //     assert.equal(isEqual(spp.successiveShortestPathAlgorithmDial(g2), M), true);
    // });

    it('Cycle cancelling', () => {
        assert.equal(isEqual(cc.cycleCancellingAlgorithm(g2), M), true);
    });

    it('Auction algorithm', () => {
        assert.equal(isEqual(auction.auctionAlgorithm(g2), M), true);
    });

    it('Auction algorithm priority queue', () => {
        assert.equal(isEqual(auction.auctionAlgorithmPriorityQueue(g2), M), true);
    });

    it('Auction algorithm priority queue decrease key', () => {
        assert.equal(isEqual(auction.auctionAlgorithmPriorityQueueDecreaseKey(g2), M), true);
    });

});

describe('Graph 2', () => {
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

    let g2 = new Graph(8, true);
    g2.addEdge(0, 4, 1, 6);
    g2.addEdge(0, 5, 1, 2);
    g2.addEdge(0, 6, 1, 5);
    g2.addEdge(0, 7, 1, 8);

    g2.addEdge(1, 4, 1, 6);
    g2.addEdge(1, 5, 1, 7);
    g2.addEdge(1, 6, 1, 1);
    g2.addEdge(1, 7, 1, 6);

    g2.addEdge(2, 4, 1, 6);
    g2.addEdge(2, 5, 1, 3);
    g2.addEdge(2, 6, 1, 4);
    g2.addEdge(2, 7, 1, 5);

    g2.addEdge(3, 4, 1, 5);
    g2.addEdge(3, 5, 1, 4);
    g2.addEdge(3, 6, 1, 3);
    g2.addEdge(3, 7, 1, 4);

    g2.setBalance(0, 1);
    g2.setBalance(1, 1);
    g2.setBalance(2, 1);
    g2.setBalance(3, 1);
    g2.setBalance(4, -1);
    g2.setBalance(5, -1);
    g2.setBalance(6, -1);
    g2.setBalance(7, -1);


    let M = hungarian_algorithm.hungarianAlgorithm(g);
    // get cost of matching
    let cost = 0;
    M.forEach(pair => {
       cost += g.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M4 = relax.relaxationAlgorithm(g2);
    // get cost of matching
    let cost4 = 0;
    M4.forEach(pair => {
        cost4 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M5 = relax.relaxationAlgorithmReducedCosts(g2);
    // // get cost of matching
    // let cost5 = 0;
    // M5.forEach(pair => {
    //     cost5 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    let M2 = spp.successiveShortestPathAlgorithm(g2);
    // get cost of matching
    let cost2 = 0;
    M2.forEach(pair => {
        cost2 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M3 = cc.cycleCancellingAlgorithm(g2);
    // get cost of matching
    let cost3 = 0;
    M3.forEach(pair => {
        cost3 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M7 = auction.auctionAlgorithm(g2);
    // get cost of matching
    let cost7 = 0;
    M7.forEach(pair => {
        cost7 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M8 = auction.auctionAlgorithmPriorityQueue(g2);
    // get cost of matching
    let cost8 = 0;
    M8.forEach(pair => {
        cost8 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M9 = auction.auctionAlgorithmPriorityQueueDecreaseKey(g2);
    // get cost of matching
    let cost9 = 0;
    M9.forEach(pair => {
        cost9 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M6 = spp.successiveShortestPathAlgorithmDial(g2);
    // // get cost of matching
    // let cost6 = 0;
    // M6.forEach(pair => {
    //     cost6 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    it('Relaxation', () => {
        assert.equal(cost4, 24);
    });

    // it('Relaxation reduced cost', () => {
    //     assert.equal(cost5, 24);
    // });

    it('Hungarian', () => {
        assert.equal(cost, 24);
    });

    it('Successive shortest paths', () => {
        assert.equal(cost2, 24);
    });

    // it('Successive shortest paths Dial', () => {
    //     assert.equal(cost6, 24);
    // });

    it('Cycle cancelling', () => {
        assert.equal(cost3, 24);
    });

    it('Auction algorithm', () => {
        assert.equal(cost7, 24);
    });

    it('Auction algorithm priority queue', () => {
        assert.equal(cost8, 24);
    });

    it('Auction algorithm priority queue decrease key', () => {
        assert.equal(cost9, 24);
    });
});

describe('Graph 3', () => {
    let g = new Graph(6, false);
    g.addEdge(0, 3, 1, 1);
    g.addEdge(0, 4, 1, 0);
    g.addEdge(0, 5, 1, 4);

    g.addEdge(1, 3, 1, 6);
    g.addEdge(1, 4, 1, 8);
    g.addEdge(1, 5, 1, 0);

    g.addEdge(2, 3, 1, 0);
    g.addEdge(2, 4, 1, 6);
    g.addEdge(2, 5, 1, 1);

    let g2 = new Graph(6, true);
    g2.addEdge(0, 3, 1, 1);
    g2.addEdge(0, 4, 1, 0);
    g2.addEdge(0, 5, 1, 4);

    g2.addEdge(1, 3, 1, 6);
    g2.addEdge(1, 4, 1, 8);
    g2.addEdge(1, 5, 1, 0);

    g2.addEdge(2, 3, 1, 0);
    g2.addEdge(2, 4, 1, 6);
    g2.addEdge(2, 5, 1, 1);

    g2.setBalance(0, 1);
    g2.setBalance(1, 1);
    g2.setBalance(2, 1);
    g2.setBalance(3, -1);
    g2.setBalance(4, -1);
    g2.setBalance(5, -1);

    let M1 = hungarian_algorithm.hungarianAlgorithm(g);
    // get cost of matching
    let cost1 = 0;
    M1.forEach(pair => {
        cost1 += g.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M4 = relax.relaxationAlgorithm(g2);
    // get cost of matching
    let cost4 = 0;
    M4.forEach(pair => {
        cost4 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M5 = relax.relaxationAlgorithmReducedCosts(g2);
    // // get cost of matching
    // let cost5 = 0;
    // M5.forEach(pair => {
    //     cost5 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    let M2 = spp.successiveShortestPathAlgorithm(g2);
    // get cost of matching
    let cost2 = 0;
    M2.forEach(pair => {
        cost2 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M6 = spp.successiveShortestPathAlgorithmDial(g2);
    // // get cost of matching
    // let cost6 = 0;
    // M6.forEach(pair => {
    //     cost6 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    let M3 = spp.successiveShortestPathAlgorithm(g2);
    // get cost of matching
    let cost3 = 0;
    M3.forEach(pair => {
        cost3 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M7 = auction.auctionAlgorithm(g2);
    // get cost of matching
    let cost7 = 0;
    M7.forEach(pair => {
        cost7 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M8 = auction.auctionAlgorithmPriorityQueue(g2);
    // get cost of matching
    let cost8 = 0;
    M8.forEach(pair => {
        cost8 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M9 = auction.auctionAlgorithmPriorityQueueDecreaseKey(g2);
    // get cost of matching
    let cost9 = 0;
    M9.forEach(pair => {
        cost9 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });


    it('Relaxation', () => {
        assert.equal(cost4, 16);
    });

    it('Relaxation reduced cost', () => {
        assert.equal(cost5, 16);
    });

    it('Hungarian', () => {
        assert.equal(cost1, 16);
    });

    it('Successive shortest paths', () => {
        assert.equal(cost2, 16);
    });

    it('Successive shortest paths Dial', () => {
        assert.equal(cost6, 16);
    });

    it('Cycle cancelling', () => {
        assert.equal(cost3, 16);
    });

    it('Auction algorithm', () => {
        assert.equal(cost7, 16);
    });

    it('Auction algorithm priority queue', () => {
        assert.equal(cost8, 16);
    });

    it('Auction algorithm priority queue decrease key', () => {
        assert.equal(cost9, 16);
    });

});

describe('Graph 4', () => {
    let g = new Graph(10, false);
    g.addEdge(0, 5, 1, 8);
    g.addEdge(0, 6, 1, 2);
    g.addEdge(0, 7, 1, 1);
    g.addEdge(0, 8, 1, 4);
    g.addEdge(0, 9, 1, 8);

    g.addEdge(1, 5, 1, 7);
    g.addEdge(1, 6, 1, 5);
    g.addEdge(1, 7, 1, 9);
    g.addEdge(1, 8, 1, 0);
    g.addEdge(1, 9, 1, 10);

    g.addEdge(2, 5, 1, 6);
    g.addEdge(2, 6, 1, 5);
    g.addEdge(2, 7, 1, 0);
    g.addEdge(2, 8, 1, 8);
    g.addEdge(2, 9, 1, 9);

    g.addEdge(3, 5, 1, 10);
    g.addEdge(3, 6, 1, 4);
    g.addEdge(3, 7, 1, 3);
    g.addEdge(3, 8, 1, 10);
    g.addEdge(3, 9, 1, 4);

    g.addEdge(4, 5, 1, 4);
    g.addEdge(4, 6, 1, 4);
    g.addEdge(4, 7, 1, 3);
    g.addEdge(4, 8, 1, 2);
    g.addEdge(4, 9, 1, 1);

    let g2 = new Graph(10, true);
    g2.addEdge(0, 5, 1, 8);
    g2.addEdge(0, 6, 1, 2);
    g2.addEdge(0, 7, 1, 1);
    g2.addEdge(0, 8, 1, 4);
    g2.addEdge(0, 9, 1, 8);

    g2.addEdge(1, 5, 1, 7);
    g2.addEdge(1, 6, 1, 5);
    g2.addEdge(1, 7, 1, 9);
    g2.addEdge(1, 8, 1, 0);
    g2.addEdge(1, 9, 1, 10);

    g2.addEdge(2, 5, 1, 6);
    g2.addEdge(2, 6, 1, 5);
    g2.addEdge(2, 7, 1, 0);
    g2.addEdge(2, 8, 1, 8);
    g2.addEdge(2, 9, 1, 9);

    g2.addEdge(3, 5, 1, 10);
    g2.addEdge(3, 6, 1, 4);
    g2.addEdge(3, 7, 1, 3);
    g2.addEdge(3, 8, 1, 10);
    g2.addEdge(3, 9, 1, 4);

    g2.addEdge(4, 5, 1, 4);
    g2.addEdge(4, 6, 1, 4);
    g2.addEdge(4, 7, 1, 3);
    g2.addEdge(4, 8, 1, 2);
    g2.addEdge(4, 9, 1, 1);

    // g2.setBalance(0, 1);
    // g2.setBalance(1, 1);
    // g2.setBalance(2, 1);
    // g2.setBalance(3, -1);
    // g2.setBalance(4, -1);
    // g2.setBalance(5, -1);

    let M3 = cc.cycleCancellingAlgorithm(g2);
    // get cost of matching
    let cost3 = 0;
    M3.forEach(pair => {
        cost3 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M1 = hungarian_algorithm.hungarianAlgorithm(g);
    // get cost of matching
    let cost1 = 0;
    M1.forEach(pair => {
        cost1 += g.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M4 = relax.relaxationAlgorithm(g2);
    // get cost of matching
    let cost4 = 0;
    M4.forEach(pair => {
        cost4 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M5 = relax.relaxationAlgorithmReducedCosts(g2);
    // // get cost of matching
    // let cost5 = 0;
    // M5.forEach(pair => {
    //     cost5 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    let M2 = spp.successiveShortestPathAlgorithm(g2);
    // get cost of matching
    let cost2 = 0;
    M2.forEach(pair => {
        cost2 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    // let M6 = spp.successiveShortestPathAlgorithmDial(g2);
    // // get cost of matching
    // let cost6 = 0;
    // M6.forEach(pair => {
    //     cost6 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    // });

    let M7 = auction.auctionAlgorithm(g2);
    // get cost of matching
    let cost7 = 0;
    M7.forEach(pair => {
        cost7 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M8 = auction.auctionAlgorithmPriorityQueue(g2);
    // get cost of matching
    let cost8 = 0;
    M8.forEach(pair => {
        cost8 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });

    let M9 = auction.auctionAlgorithmPriorityQueueDecreaseKey(g2);
    // get cost of matching
    let cost9 = 0;
    M9.forEach(pair => {
        cost9 += g2.nodes[pair.source].adjacencyList.get(pair.destination).cost;
    });


    it('Relaxation', () => {
        assert.equal(cost4, 40);
    });

    // it('Relaxation reduced cost', () => {
    //     assert.equal(cost5, 40);
    // });

    it('Hungarian', () => {
        assert.equal(cost1, 40);
    });

    it('Cycle cancelling', () => {
        assert.equal(cost3, 40);
    });

    it('Successive shortest paths', () => {
        assert.equal(cost2, 40);
    });

    // it('Successive shortest paths Dial', () => {
    //     assert.equal(cost6, 40);
    // });

    it('Auction algorithm', () => {
        assert.equal(cost7, 40);
    });

    it('Auction algorithm priority queue', () => {
        assert.equal(cost8, 40);
    });

    it('Auction algorithm priority queue decrease key', () => {
        assert.equal(cost9, 40);
    });
});
