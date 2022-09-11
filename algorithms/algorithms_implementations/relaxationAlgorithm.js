const utils = require("../utils");
const {reduceCosts} = require("../utils");

/**
 * Solves maximum bipartite weighted matching
 * Relaxation algorithm, based on "Network Flows. Theory, Algorithms and Applications",
 * Ahuja, Magnant, Orlin, section 12.4, p.472
 * Choosing not matched and overassigned nodes is based on sets
 * Time complexity of sets: time complexity https://stackoverflow.com/questions/31091772/javascript-es6-computational-time-complexity-of-collections
 * @param graph directed graph (edges from the first set to the second one, if bipartite), nodes with balances
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
function relaxationAlgorithm(graph) {
    let M = new Set();
    let overassigned = new Set();
    // negate costs - min to max
    let graphNegative = graph.getCopyWithOppositeCosts();

    graphNegative.nodes.forEach(node => {
       node.assignmentNumber =  0;
    });

    graphNegative.constructResidual();

    // assign each node in the first set node from the second set with minimum weight
    let half = graphNegative.vNo / 2 - 1;
    let min = null;
    let minIndex = 0;
    for (let i = 0; i <= half; i++) {
        min = null;
        graphNegative.nodes[i].adjacencyList.forEach(neighbour => {
            if (min === null || min > neighbour.cost) {
                min = neighbour.cost;
                minIndex = neighbour.key;
            }
        });
        // set matching (some node from the second set may be overassigned)
        graphNegative.nodes[i].adjacencyList.get(minIndex).flow = 1;
        graphNegative.nodes[i].adjacencyListResidual.get(minIndex).capacity -= 1;
        graphNegative.nodes[minIndex].adjacencyListResidual.get(i).capacity += 1;
        graphNegative.nodes[minIndex].assignmentNumber++;
        if (graphNegative.nodes[minIndex].assignmentNumber === 2) {
            overassigned.add(minIndex);
        }
    }

    let notMatched = new Set();
    // find out which nodes in the second set are not assigned
    for (let i = half + 1; i < graphNegative.vNo; i++) {
        if (graphNegative.nodes[i].assignmentNumber === 0) {
            notMatched.add(i);
        }
    }

    // console.log("-----------------------")
    // graphNegative.printGraphResidual();
    // console.log("-----------------------");
    //graphNegative.printFlow();

    let iteratorOverassigned;
    let overassignedKey;
    while (true) {
        // choose overassigned node from the second set
        //console.log(graphNegative.nodes)
        iteratorOverassigned = overassigned.values();
        overassignedKey = iteratorOverassigned.next().value; // get first key form set
       // graphNegative.printFlow();
        if (overassignedKey) {
            //console.log(overassignedKey, " ", graphNegative.nodes[overassignedKey].assignmentNumber);
            // obtain shortest path distances from this node to all other nodes in residual network
            // console.log("--------------s")
            // graphNegative.printGraphResidual();
            // console.log("--------------e")
            utils.fifoLabelCorrectingResidual(graphNegative, overassignedKey, null);
            // console.log("--------------s1")
            // graphNegative.printDistances();
            // console.log("--------------e1")

            // choose node with no assigment and follow the shortest path along it
            for (let node of notMatched) { // maybe here get the shortest path...
               if (graphNegative.nodes[node].dist !== null) { // reachable from overassigned node
                   //console.log("chosen ", node)
                   // augment flow along the path
                   utils.updateResidualCapacities(graphNegative, 1, node);
                   notMatched.delete(node);
                   graphNegative.nodes[overassignedKey].assignmentNumber--;
                   if (graphNegative.nodes[overassignedKey].assignmentNumber === 1) {
                       overassigned.delete(overassignedKey);
                   }
                   break;
               }
            }
            // let min = null;
            // let chosen = 0;
            // for (let node of notMatched) { // maybe here get the shortest path...
            //     if (graphNegative.nodes[node].dist !== null && (min === null || min > graphNegative.nodes[node].dist)) { // reachable from overassigned node
            //         min = graphNegative.nodes[node].dist;
            //         chosen = node;
            //     }
            // }
            // console.log(chosen)
            // utils.updateResidualCapacities(graphNegative, 1, chosen);
            // notMatched.delete(chosen);
            // graphNegative.nodes[overassignedKey].assignmentNumber--;
            // if (graphNegative.nodes[overassignedKey].assignmentNumber === 1) {
            //     overassigned.delete(overassignedKey);
            // }
        } else {
            // get matching and return
            for (let i = 0; i < graphNegative.vNo; i++) {
                graphNegative.nodes[i].adjacencyList.forEach(neighbour => {
                   // console.log("i ", i, " neighbour ", neighbour, " flow ", neighbour.flow)
                    if (neighbour.flow > 0) {
                        M.add({source: i, destination: neighbour.key});
                    }
                });
            }
            return M;
        }
    }
}

function relaxationAlgorithmReducedCosts(graph) {
    let M = new Set();
    let overassigned = new Set();
    // negate costs - min to max
    let graphNegative = graph.getCopyWithOppositeCosts();

    graphNegative.nodes.forEach(node => {
        node.assignmentNumber =  0;
    });

    let min1 = null;
    graphNegative.nodes.forEach(node => {
       node.adjacencyList.forEach(neighbour => {
           if (min1 === null || min1 > neighbour.cost) {
               min1 = neighbour.cost;
           }
       })
    });

    graphNegative.nodes.forEach(node => {
        node.adjacencyList.forEach(neighbour => {
            neighbour.cost += min1;
        })
    });

    graphNegative.constructResidual();

    // assign each node in the first set node from the second set with minimum weight
    let half = graphNegative.vNo / 2 - 1;
    let min = null;
    let minIndex = 0;
    for (let i = 0; i <= half; i++) {
        min = null;
        graphNegative.nodes[i].adjacencyList.forEach(neighbour => {
            if (min === null || min > neighbour.cost) {
                min = neighbour.cost;
                minIndex = neighbour.key;
            }
        });
        // set matching (some node from the second set may be overassigned)
        graphNegative.nodes[i].adjacencyList.get(minIndex).flow = 1;
        graphNegative.nodes[i].adjacencyListResidual.get(minIndex).capacity -= 1;
        graphNegative.nodes[minIndex].adjacencyListResidual.get(i).capacity += 1;
        graphNegative.nodes[minIndex].assignmentNumber++;
        if (graphNegative.nodes[minIndex].assignmentNumber === 2) {
            overassigned.add(minIndex);
        }
    }

    let notMatched = new Set();
    // find out which nodes in the second set are not assigned
    for (let i = half + 1; i < graphNegative.vNo; i++) {
        if (graphNegative.nodes[i].assignmentNumber === 0) {
            notMatched.add(i);
        }
    }
    console.log("__________________")
    graphNegative.printGraphResidual();
    console.log("__________________")
    // get any node and set node potentials
    //utils.fifoLabelCorrectingResidual(graphNegative, 0, null);
    console.log("__________________")
    graphNegative.printDistances();
    console.log("__________________");
    // graphNegative.nodes.forEach(node => {
    //     if (node.dist === null) {
    //         node.dist = 0;
    //     }
    // });
    // utils.reduceCosts(graphNegative);
    console.log("__________________")
    graphNegative.printGraphResidual();
    console.log("__________________")


    let iteratorOverassigned;
    let overassignedKey;
    while (true) {
        // choose overassigned node from the second set
        iteratorOverassigned = overassigned.values();
        overassignedKey = iteratorOverassigned.next().value; // get first key form set

        if (overassignedKey) {
            // obtain the shortest path distances from this node to all other nodes in residual network
            utils.dijkstraResidual(graphNegative, overassignedKey, null);
            // graphNegative.nodes.forEach(node => {
            //     if (node.dist === null) {
            //         node.dist = 0;
            //     }
            // });
            // reduceCosts(graphNegative);
            // choose node with no assigment and follow the shortest path along it
            for (let node of notMatched) {
                if (node.dist !== null) { // reachable from overassigned node
                    // augment flow along the path
                    utils.updateResidualCapacities(graphNegative, 1, node);
                    notMatched.delete(node);
                    graphNegative.nodes[overassignedKey].assignmentNumber--;
                    if (graphNegative.nodes[overassignedKey].assignmentNumber === 1) {
                        overassigned.delete(overassignedKey);
                    }
                    break;
                }
            }
        } else {
            // get matching and return
            for (let i = 0; i < graphNegative.vNo; i++) {
                graphNegative.nodes[i].adjacencyList.forEach(neighbour => {
                    // console.log("i ", i, " neighbour ", neighbour, " flow ", neighbour.flow)
                    if (neighbour.flow > 0) {
                        M.add({source: i, destination: neighbour.key});
                    }
                });
            }
            return M;
        }
    }
}

module.exports = {
    relaxationAlgorithm,
    relaxationAlgorithmReducedCosts
};