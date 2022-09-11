const assert = require('assert');
const Graph = require("../algorithms/structures/Graph");
const algorithms_functions = require("../algorithms/algorithms_functions");


/*describe('Graph 1', () => {
    let g = new Graph(6);
    g.addEdge(0, 1, 11);
    g.addEdge(0, 2, 12);
    g.addEdge(2, 1, 1);
    g.addEdge(1, 3, 12);
    g.addEdge(2, 4, 11);
    g.addEdge(4, 3, 7);
    g.addEdge(3, 5, 19);
    g.addEdge(4, 5, 4);

    it('Edmonds-Karp', () => {
        assert.equal(algorithms_functions.edmondsKarp(g, 0, 5), 23);
    });

    it('Dinics', () => {
        assert.equal(algorithms_functions.dinics(g, 0, 5), 23);
    });
}); */

describe('Graph 2', () => {
    let g = new Graph(6);
    g.addEdge(0, 1, 6);
    g.addEdge(0, 2, 5);
    g.addEdge(0, 3, 3);
    g.addEdge(1, 3, 1);
    g.addEdge(1, 5, 3);
    g.addEdge(2, 3, 1);
    g.addEdge(2, 4, 2);
    g.addEdge(3, 5, 7);
    g.addEdge(3, 4, 9);
    g.addEdge(4, 5, 5);

    /*it('Edmonds-Karp', () => {
        assert.equal(algorithms_functions.edmondsKarp(g, 0, 5), 10);
    });*/

   /* it('Dinics', () => {
        assert.equal(algorithms_functions.dinics(g, 0, 5), 10);
    }); */
});