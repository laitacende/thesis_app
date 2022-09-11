const utils = require("../utils");
// TODO
function costScallingAlgorithm(graph) {
    // max problem to min problem
    let graphNeg = graph.getCopyWithOppositeCosts();
    // find minimum cost
    let min = utils.getMinCost(graphNeg);
    // if needed, make the costs positive
    if (min < 0) {
        // TODO maybe make copy
        graphNeg.nodes.forEach(node => {
           node.adjacencyList.forEach(neighbour => {
               neighbour.cost -= min;
           }) ;
        });
    }

    let max = utils.getMaxCost(graphNeg);
}