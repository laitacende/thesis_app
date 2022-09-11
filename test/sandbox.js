const relaxation = require('../algorithms/algorithms_implementations/relaxationAlgorithm');
const Graph = require("../algorithms/structures/Graph");
const spp = require("../algorithms/algorithms_implementations/successiveShortestPathAlgorithm");
const auction = require("../algorithms/algorithms_implementations/auctionAlgorithm");

let g = new Graph(6, true);
g.addEdge(0, 3, 1, 1);
g.addEdge(0, 4, 1, 6);
g.addEdge(0, 5, 1, 0);
g.addEdge(1, 3, 1, 0);
g.addEdge(1, 4, 1, 8);
g.addEdge(1, 5, 1, 6);
g.addEdge(2, 3, 1, 4);
g.addEdge(2, 4, 1, 0);
g.addEdge(2, 5, 1, 1);
// let g = new Graph(4, true);
// g.addEdge(0, 3, 1, 1);
// g.addEdge(0, 2, 1, 6);
// g.addEdge(1, 3, 1, 0);
// g.addEdge(1, 2, 1, 8);

console.log(auction.auctionAlgorithm(g));

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

//console.log(spp.successiveShortestPathAlgorithmDial(g2));