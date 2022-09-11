const utils = require("../utils");
const algorithms_functions = require("../algorithms_functions");

// based on https://www.topcoder.com/thrive/articles/Minimum%20Cost%20Flow%20Part%20Two:%20Algorithms
// directed graph
function cycleCancellingAlgorithm(graph) {
    // set balances, first half suppliers, the other one customers
    let half = graph.vNo / 2 - 1;
    for (let i = 0; i <= half; i++) {
        graph.nodes[i].balance = 1;
    }

    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].balance = -1;
    }

    // negate costs - min to max
    let graphNegative = graph.getCopyWithOppositeCosts();

    // construct a graph for max flow algorithm
    // add new source and connect with 'suppliers'
    // add new target and connect with 'clients'
    // use max flow algorithm to find feasible flow

    let graphFeasible = graphNegative.getCopyForMaxFlow();
    if (graphFeasible == null) {
        console.log("There is no feasible solution");
        return -1;
    }
    // not necessarily needed here
    // algorithms_functions.dinics(graphFeasible, graphFeasible.vNo - 2, graphFeasible.vNo - 1);
    // // check if the found flow saturates the edges from source and to target
    // graphFeasible.nodes[graphFeasible.vNo - 1].adjacencyList.forEach(neighbour => {
    //     if (neighbour.flow !== neighbour.capacity) {
    //         console.log("There is no feasible solution");
    //         return -1;
    //     }
    // });

    // can be done like this (just get some matching - connect node i with node i + n/2
    // and saturate edges from source and to target
    for (let i = 0; i <= half; i++) {
        graphFeasible.nodes[i].adjacencyList.get(i + half + 1).flow = 1;
    }

    // source
    graphFeasible.nodes[graphFeasible.vNo - 2].adjacencyList.forEach(neighbour => {
       neighbour.flow = 1;
    });

    let target = graphFeasible.vNo - 1;
    // saturate to target
    for (let i = half + 1; i < graph.vNo; i++) {
        graphFeasible.nodes[i].adjacencyList.get(target).flow = 1;
    }


    let key = null;
    let negativeCycle = true;
    // now detect negative cycles in residual graph
    graphFeasible.constructResidual();
    updateResidual(graphFeasible); // set residual capacities according to found flow
    while (negativeCycle) {
        key = utils.fifoLabelCorrectingResidualNegativeCycle(graphFeasible, graphFeasible.vNo - 1);
        if (key === null) {
            negativeCycle = false;
        } else {
            // augment flow along the cycle (min capacity of this cycle is 1 - from the definition)
            let min = null;
            min = 1;
            utils.updateResidualCapacitiesCycle(graphFeasible, min, key);
            // overall flow is max (started from maximum flow)
        }
    }
    // get assigment
    let M = new Set();
    for (let i = 0; i < graphFeasible.vNo - 2; i++) {
        graphFeasible.nodes[i].adjacencyList.forEach(neighbour => {
            if (neighbour.flow > 0 && neighbour.key < graphFeasible.vNo - 2) {
                M.add({source: i, destination: neighbour.key});
            }
        });
    }
    return M;
}

function updateResidual(graph) {
    graph.nodes.forEach(node => {
       node.adjacencyList.forEach(neighbour => {
           if (neighbour.flow > 0) {
               node.adjacencyListResidual.get(neighbour.key).capacity -= neighbour.flow;
               graph.nodes[neighbour.key].adjacencyListResidual.get(node.key).capacity += neighbour.flow;
           }
       }) ;
    });
}

module.exports = {
    cycleCancellingAlgorithm
};