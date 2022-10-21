const utils = require("../utils");

/**
 * Bipartite weighted maximum matching, required the same number of vertices in both sets
 * O(n^3) version based on http://www.columbia.edu/~cs2035/courses/ieor6614.S16/GolinAssignmentNotes.pdf
 *
 * Set objects should be sublinear.
 * Time complexity:
 * Getting feasible labeling is O(V + E) = O(n/2 + n^2/4) = O(n^2).
 * Checking if matching is perfect O(n).
 * Checking if two sets equal O(n^2).
 * In each phase matching cardinality increases by 1, so at most O(n) phases.
 * Overall time complexity O(n^3).
 *
 *
 * @param graph bipartite undirected graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
function hungarianAlgorithm(graph) {
    // matching
    let M;
    let half = graph.vNo / 2 - 1;

    // find feasible labeling
    getFeasibleLabeling(graph); // O(n^2)
    let equalityGraph = graph.getEqualityGraph(); // O(V+E) = O(n^2/4)

    // initial matching
    M = getMatching(equalityGraph, graph); // O(n^2/4)
    let S = new Set(); // subset of vertices from the first set
    let T = new Set(); // alternating tree
    let root = -1;
    // check if matching is perfect
    let SNeighbours;
    while (!isPerfectMatching(graph, M)) { // O(n)
        // M is not perfect, hence there is some exposed (not matched) node
        // augment path
        if (root === -1) {
            // find new exposed node in the first set
            let notSaturated = -1;
            let half = graph.vNo / 2 - 1;
            for (let i = 0; i <= half; i++) { // O(n/2)
                if (!graph.nodes[i].saturated) {
                    notSaturated = graph.nodes[i].key;
                    root = notSaturated;
                    S.add(notSaturated);
                    break;
                }
            }
            T = new Set();
        }
        // get neighbours of S
        SNeighbours = getNeighboursOfSet(equalityGraph, S); // O(n^2/4)
        if (isEqual(SNeighbours, T)) { // O(n^2)
            // update labels forcing SNeigbours !== T
            // alpha is minimum of l(x)+l(y)-c(x,y) of
            let alpha = null;
            S.forEach(x => { // O(n) * O(n/2 * n) = O(n^3/2)
                for (let i = half + 1; i < graph.vNo; i++) {
                    if (!T.has(i)) { // y not in T
                        let newAlpha = graph.nodes[x].label + graph.nodes[i].label - graph.nodes[x].adjacencyList.get(i).cost;
                        if (alpha === null || alpha > newAlpha) {
                            alpha = newAlpha;
                        }
                    }
                }
            });
            if (alpha !== null) { // update labelling
                // if v in S l'(v) = l(v) - alpha
                // if v in T l'(v) = l(v) + alpha
                // otherwise l'(v) = l(v)
                for (let i = 0; i < graph.vNo; i++) { // O(n^2)
                    if (S.has(i)) {
                        graph.nodes[i].label =  graph.nodes[i].label - alpha;
                    } else if (T.has(i)) {
                        graph.nodes[i].label =  graph.nodes[i].label + alpha;
                    }
                }
                equalityGraph = graph.getEqualityGraph(); // O(n^2/4)
            }
        }

        if (!isEqual(SNeighbours, T)) { // O(n^2)
            // pick y in SNeighbours / T
            let y = null;
            SNeighbours.forEach(key => {
                if (!T.has(key)) {
                    y = key;
                }
            });
            if (y !== null) {
                T.add(y);
                let z = checkWhereMatched(M, y); // O(n)
                // check if y is free  - then path from root to y is an augmenting path
                if (z === null) {
                    // augment matching
                    // perform dfs on equality graph to find augmenting paths (ending in 'free' node)
                    let path = utils.dfsGetPath(equalityGraph, root, y, M); // path to root O(n^2/4)
                    for (let i = path.length - 1; i > 0; i--) {
                        let x = path[i];
                        let y = path[i - 1];
                        if (path[i] > graph.vNo / 2 - 1) {
                            [x, y] = [y, x]
                        }
                        let pair = isInMatching(M, x, y); // O(n)
                        if (pair !== null) {
                            // remove
                            M.delete(pair);
                        } else if (equalityGraph.nodes[x].adjacencyList.get(y) !== undefined) {
                            // add to M
                            M.add({source: x, destination: y});
                        }
                    }

                    root = -1;
                    S = new Set();
                    T = new Set();
                } else {
                    // y is matched (e.g. to z), extend alternating tree
                    // S = S u {z}
                    // T = T u {y}
                    S.add(z);
                }
            }
        }
    }
    return M;
}

/**
 * Function that generates initial feasible labeling.
 * For x in X label is the greatest edge weight, for y in Y it is 0.
 * @param graph V = X u Y
 */
function getFeasibleLabeling(graph) {
    // reset labels
    graph.nodes.forEach(node => {
       node.label = -1;
    });

    let half = graph.vNo / 2 - 1;
    // start from one side
    for (let i = 0; i <= half; i++) {
        let max = -1;
        let max_index = -1;
        graph.nodes[i].adjacencyList.forEach(neighbour => {
           if (max < neighbour.cost) {
               max = neighbour.cost;
               max_index = neighbour.key;
           }
        });

        // match these nodes by giving them label (label is the cost)
        graph.nodes[i].label = max;
    }
    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].label = 0;
    }
}

/**
 * Function that checks if given matching is perfect for this graph.
 * @param graph
 * @param M matching in form {source: key, destination: key}
 * @returns {boolean} true if matching is perfect, false otherwise
 */
function isPerfectMatching(graph, M) {
    graph.nodes.forEach(node => {
        node.saturated = false;
    });
    let saturatedVertices = new Set();
    M.forEach(edge => {
        saturatedVertices.add(edge.source);
        saturatedVertices.add(edge.destination);
        graph.nodes[edge.source].saturated = true;
        graph.nodes[edge.destination].saturated = true;
    });
    return saturatedVertices.size === graph.vNo;
}

/**
 * Function that returns a set of neighbours for given set of nodes.
 *
 * @param graph
 * @param S set of nodes
 * @returns {Set<any>} set of neighbours of nodes in S
 */
function getNeighboursOfSet(graph, S) {
    let SNeigh = new Set();
    S.forEach(key => {
       graph.nodes[key].adjacencyList.forEach(neighbour => {
           SNeigh.add(neighbour.key);
       });
    });
    return SNeigh;
}

/**
 * Function that checks if two sets are equal.
 *
 * @param a first set
 * @param b second set
 * @returns {boolean} true if sets are equal, false otherwise
 */
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

/**
 * Function that sets initial matching.
 *
 * @param equalityGraph equality graph (only edges satisfying label(x) + label(y) == cost(x, y))
 * @param graph original graph
 * @returns {Set<any>} matching - set of edges in the form {source:key, destination: key}
 */
function getMatching(equalityGraph, graph) {
    let half = graph.vNo / 2 - 1;
    let M = new Set(); // set contains objects in the form of {source: key, destination: key}
    // matching is built of edges with max weight in the second set
    for (let i = 0; i <= half; i++) {
        if (!graph.nodes[i].saturated) {
            // find edge with max cost
            let max = null;
            let max_index = null;
            equalityGraph.nodes[i].adjacencyList.forEach(y => {
                if (!graph.nodes[y.key].saturated && (max == null || max < y.cost)) {
                    max = y.cost;
                    max_index = y.key;
                }
            });
            if (max_index != null ) {
                M.add({source: i, destination: max_index});
                graph.nodes[max_index].saturated = true;
            }
        }
    }
    return M;
}

/**
 * Function returns the other end of edge which covers node y.
 * @param M matching
 * @param y node
 * @returns node which is the other end of the edge in matching, null if there is no edge with y on either end
 */
function checkWhereMatched(M, y) {
    for (const pair of M) {
        if (pair.source === y) {
            return pair.destination;
        }
        if (pair.destination === y) {
            return pair.source;
        }
    }

    return null;
}

/**
 * Function checks whether edge is in given matching.
 * @param M matching
 * @param x source of the edge
 * @param y destination of the edge
 * @returns pair {source: x, destination: y} if it is in matching, null otherwise
 */
function isInMatching(M, x, y) {
    for (const pair of M) {
        if (pair.source === x && pair.destination === y) {
            return pair;
        }
    }
    return null;
}

module.exports = {
    hungarianAlgorithm
};
