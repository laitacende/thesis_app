const utils = require("../utils");

/**
 * Solves maximum bipartite weighted matching.
 * Cycle cancelling algorithm implementation based on https://www.topcoder.com/thrive/articles/Minimum%20Cost%20Flow%20Part%20Two:%20Algorithms
 * Base assigment is i to i + n/2.
 * Algorithm sets balances of nodes - first set to 1, second set to -1.
 *
 * Time complexity:
 * Establishing feasible flow O(n/2).
 * Updating, constructing residual is O(n^2/4).
 * FIFO label correcting algorithm O(VE) = O(n * n^2/4) = O(n^3/4).
 * Maximum capacity of an arc is 1, maximum cost (absolute value) is 10.
 * Maximum of the objective function is ECU, cycle cancelling algorithm decreases
 * the objective function by strictly objective amount, data is integral so algorithm
 * takes O(ECU) iterations, here O(E).
 * Overall time complexity: O(n/2 + n^2/4 * n^3/4) = O(n^5).
 *
 * @param graph bipartite directed graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
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
    // use max flow algorithm to find feasible flow - not needed here, it is sufficient to get any matching

    // not applicable here, instances always -b + b = 0
    // let graphFeasible = graphNegative.getCopyForMaxFlow();
    // if (graphFeasible == null) {
    //     console.log("There is no feasible solution");
    //     return null;
    // }

    // get some matching - connect node i with node i + n/2 and saturate edges from source and to target
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
    // detect negative cycles in residual graph
    graphFeasible.constructResidual();
    updateResidualBasedOnFlow(graphFeasible); // set residual capacities according to found flow
    while (negativeCycle) {
        key = utils.fifoLabelCorrectingResidualNegativeCycle(graphFeasible, graphFeasible.vNo - 1);
        if (key === null) {
            negativeCycle = false;
        } else {
            // augment flow along the cycle (min capacity of this cycle is 1 - from the definition)
            let min = null;
            min = 1;
            utils.updateResidualCapacitiesCycle(graphFeasible, min, key);
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

/**
 * Function that sets residual capacities according to some flow going from the first set to the
 * second set of vertices.
 * @param graph bipartite directed graph, first set indices 0..(n - 1), second set n..(2n - 1)
 */
function updateResidualBasedOnFlow(graph) {
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