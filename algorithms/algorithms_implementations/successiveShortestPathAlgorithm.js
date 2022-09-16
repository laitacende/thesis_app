const utils = require("../utils");

/**
 * Solves max-flow-min-cost problem.
 * Algorithm based on description in "Network Flows. Theory, Algorithms and Applications",
 * Ahuja, Magnant, Orlin, section 12.4, p.471.
 * Uses FIFO label correcting algorithm to find the shortest paths.
 * @param graph bipartite directed graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
// todo zamiast fifo moze byc deque
function successiveShortestPathAlgorithm(graph) {
    // set balances, first half suppliers, the other one customers
    let half = graph.vNo / 2 - 1;
    for (let i = 0; i <= half; i++) {
        graph.nodes[i].balance = 1;
    }

    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].balance = -1;
    }

    // transform costs (make then negative so min will be the max)
    let graphNegativeCosts = graph.getCopyWithOppositeCosts();

    // now we look for a matching that minimizes the cost (flow)
    let flowGraph = graphNegativeCosts.getCopyForMaxFlow(); // get graph with source and target
    let source = flowGraph.vNo - 2;
    let target = flowGraph.vNo - 1;
    let flow = 0;
    flowGraph.constructResidual();

    // look for the shortest path in the residual graph in terms of weight of edges
    while (utils.fifoLabelCorrectingResidual(flowGraph, source, target)) {
        // augment flow along the found path
        // no need to find min, as it is 1 in assigment
        let min = null;
        min = 1;
        /*let curr = target;
        let prev = flowGraph.nodes[curr].prev;
        while (prev !== curr) {

            if (min === null || flowGraph.nodes[prev].adjacencyListResidual.get(curr).capacity < min) {
                min = flowGraph.nodes[prev].adjacencyListResidual.get(curr).capacity;
            }
            curr = flowGraph.nodes[curr].prev;
            prev = flowGraph.nodes[curr].prev;
        } */
        // augment flow on the path by min
        flow += min;
        utils.updateResidualCapacities(flowGraph, min, target);
    }
    // get assigment
    let M = new Set();
    for (let i = 0; i < flowGraph.vNo - 2; i++) {
        flowGraph.nodes[i].adjacencyList.forEach(neighbour => {
           if (neighbour.flow > 0 && neighbour.key < flowGraph.vNo - 2) {
               M.add({source: i, destination: neighbour.key});
           }
        });
    }
    return M;
}

// doesnt work
function successiveShortestPathAlgorithmDial(graph) {
    // transform costs (make then negative so min will be the max)
    let graphNegativeCosts = graph.getCopyWithOppositeCosts();
    // find min cost and add this to cost to make them positive
    // let graphPositive = graphNegativeCosts.getCopyWithPositiveCosts();

    // now we look for a matching that minimizes the cost (flow)
    let flowGraph = graphNegativeCosts.getCopyForMaxFlow(); // get graph with source and target
    let source = flowGraph.vNo - 2;
    let target = flowGraph.vNo - 1;
    let flow = 0;
    flowGraph.constructResidual();
    if (!utils.fifoLabelCorrectingResidual(flowGraph, source, target)) {
        console.log("Graph contains negative cycle");
        return null;
    }
    utils.fifoLabelCorrectingResidual(flowGraph, source, null);
    flowGraph.printDistances();
    // flowGraph.nodes.forEach(node => {
    //    node.distRes = node.dist;
    // });
    // reduce costs (make all edge weights positive)
    utils.reduceCosts(flowGraph);
    console.log("------------s")
    flowGraph.printGraphResidual();
    console.log("------------s")
    // look for the shortest path in the residual graph in terms of weight of edges
    while (utils.dialResidual(flowGraph, source, target)) {
        // reduce cost
        //utils.reduceCosts(flowGraph);
        // augment flow along the found path
        // find min TODO is it needed? max capacity is 1... - assigment
        let min = null;
        min = 1;
        /*let curr = target;
        let prev = flowGraph.nodes[curr].prev;
        while (prev !== curr) {

            if (min === null || flowGraph.nodes[prev].adjacencyListResidual.get(curr).capacity < min) {
                min = flowGraph.nodes[prev].adjacencyListResidual.get(curr).capacity;
            }
            curr = flowGraph.nodes[curr].prev;
            prev = flowGraph.nodes[curr].prev;
        }
        // augment flow on the path by min
        console.log("min ", min) */
        flow += min;
        utils.updateResidualCapacities(flowGraph, min, target);
    }
    // get assigment
    let M = new Set();
    for (let i = 0; i < flowGraph.vNo - 2; i++) {
        flowGraph.nodes[i].adjacencyList.forEach(neighbour => {
            if (neighbour.flow > 0 && neighbour.key < flowGraph.vNo - 2) {
                M.add({source: i, destination: neighbour.key});
            }
        });
    }
    return M;
}

function reduceCosts(graph) {
    graph.nodes.forEach(node => {
        node.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0) {
                neighbour.cost = neighbour.cost + node.dist - graph.nodes[neighbour.key].dist;
            }
            // if (neighbour.capacity !== 0) {
            //     if (!neighbour.isReversed) {
            //         neighbour.cost = neighbour.cost + node.dist - graph.nodes[neighbour.key].dist;
            //     } else {
            //         neighbour.cost = 0;
            //     }
            // }
        });
    });
}

function reduceCosts2(graph) {
    graph.nodes.forEach(node => {
        node.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0) {
                neighbour.cost = neighbour.cost + node.dist;
            }
            // if (neighbour.capacity !== 0) {
            //     if (!neighbour.isReversed) {
            //         neighbour.cost = neighbour.cost + node.dist - graph.nodes[neighbour.key].dist;
            //     } else {
            //         neighbour.cost = 0;
            //     }
            // }
        });
    });
}

module.exports = {
    successiveShortestPathAlgorithm,
    successiveShortestPathAlgorithmDial
};
