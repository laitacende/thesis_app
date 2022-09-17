const Stack = require("./structures/Stack");
const utils = require("./utils");

/**
 * Dinics algorithm implementation. Finds maximum flow in a directed graph with source and target.
 * @param graph directed graph
 * @param source node which is the source of the flow
 * @param target node which is the target of the flow
 * @returns {number} value of maximum flow
 */
function dinics(graph, source, target) {
    let maxFlow = 0;

    // flow on every arc is 0
    graph.nodes.forEach(node => {
        node.adjacencyList.forEach((neighbour, key) => {
            neighbour.flow = 0;
        });
    });
    graph.constructResidual();
    // construct level network from the residual one
    while (utils.bfsLevel(graph, source, target)) {
        // find blocking flow in level network with dfs
        let flow = Number.MAX_VALUE;
        while (flow > 0) {
            flow = utils.dfsRecursive(graph, source, source, target, flow);
           // flow = utils.dfsRe(graph, source, target);
            if (flow > 0) {
                maxFlow += flow;
            }
        }
    }
    return maxFlow;
}

/**
 * Implementation of Edmonds-Karp algorithm. Solves maximum flow in a directed graph.
 * @param graph directed graph
 * @param source node which is the source of the flow
 * @param target node which is the target of the flow
 * @returns {number} value of maximum flow
 */
function edmondsKarp(graph, source, target) {
    let maxFlow = 0;
    // in the beginning flow of every arc is 0
    graph.nodes.forEach(node => {
        node.adjacencyList.forEach((neighbour, key) => {
            neighbour.flow = 0;
        });
    });

    graph.constructResidual();

    // augment flow, if there exists augmenting path
    while (utils.bfsResidual(graph, source, target)) {
        // find minimum residual capacity on found path
        let min = Number.MAX_VALUE;
        let curr = target;
        let prev = graph.nodes[curr].prev;
        while (prev !== curr) {
            if (graph.nodes[prev].adjacencyListResidual.get(curr).capacity < min) {
                min = graph.nodes[prev].adjacencyListResidual.get(curr).capacity;
            }
            curr = graph.nodes[curr].prev;
            prev = graph.nodes[curr].prev;
        }
        // augment flow on the path by min
        maxFlow += min;

        // update residual network
        utils.updateResidualCapacities(graph, min, target);
    }
    return maxFlow;
}


module.exports = {
    dinics,
    edmondsKarp
};