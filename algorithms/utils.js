const Queue = require("./structures/Queue");
const Stack = require("./structures/Stack");
const CircularList = require("./structures/CircularList");
const PriorityQueueDecreaseKey = require("./structures/PriorityQueueDecreaseKey");

/**
 * Implementation of breadth first search algorithm in residual graph.
 * Can stop after reaching the target.
 *
 * @param graph graph to be explored
 * @param source start node
 * @param target identifier of node to be reached
 * @returns {boolean} true if target was reached, false otherwise
 */
function bfsResidual(graph, source, target) {
    graph.nodes.forEach(node => {
        node.dist = Number.MAX_VALUE;
        node.prev = -1;
    });

    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;

    // create fifo
    let queue = new Queue();
    queue.push(source);

    while (!queue.empty()) {
        let v = graph.nodes[queue.pop()];
        if (v.key === target) {
            return true;
        }
        v.adjacencyListResidual.forEach((node, key) => {
            // go backward if residual flow > 0, go forward where flow < capacity (can send more)
            if (graph.nodes[node.key].dist === Number.MAX_VALUE && node.capacity > 0) {
                queue.push(node.key);
                graph.nodes[node.key].dist = v.dist + 1;
                graph.nodes[node.key].prev = v.key;
            }
        });
    }

    return false;
}

/**
 * Function to update capacities in residual network according to flow on set path.
 *
 * @param graph graph
 * @param min minimum capacity of the path, the flow will be augmented by this amount
 * @param target endpoint of the augmenting path
 */
function updateResidualCapacities(graph, min, target) {
    // set residual edges capacities according to flow
    // if max capacity then there's only one edge in residual network to
    // 'give back the flow'
    // if edge doesn't exist residual capacity is 0
    let curr = target;
    let prev = graph.nodes[curr].prev;
    while (prev !== curr) {
        // from target to source
        if (graph.nodes[prev].adjacencyList.get(curr) === undefined) { // backward edge, give back flow
            graph.nodes[curr].adjacencyList.get(prev).flow -= min;
        } else {
            graph.nodes[prev].adjacencyList.get(curr).flow += min;
        }
        // update residual graph
        graph.nodes[curr].adjacencyListResidual.get(prev).capacity += min;
        graph.nodes[prev].adjacencyListResidual.get(curr).capacity -= min;
        curr = graph.nodes[curr].prev;
        prev = graph.nodes[curr].prev;
    }
}

/**
 * Function to update capacities in residual network according to flow on set cycle.
 *
 * @param graph graph
 * @param min minimum capacity of the path, the flow will be augmented by this amount
 * @param target node in cycle
 */
function updateResidualCapacitiesCycle(graph, min, target) {
    // set residual edges capacities according to flow
    // if max capacity then there's only one edge in residual network to
    // 'give back the flow'
    // if edge doesn't exist residual capacity is 0
    let first = true;
    let curr = target;
    let prev = graph.nodes[curr].prev;
    while (curr !== target || first) {
        first = false;
        // from target to source
        if (graph.nodes[prev].adjacencyList.get(curr) === undefined) { // backward edge, give back flow
            graph.nodes[curr].adjacencyList.get(prev).flow -= min;
        } else {
            graph.nodes[prev].adjacencyList.get(curr).flow += min;
        }
        // update residual graph
        graph.nodes[curr].adjacencyListResidual.get(prev).capacity += min;
        graph.nodes[prev].adjacencyListResidual.get(curr).capacity -= min;
        curr = graph.nodes[curr].prev;
        prev = graph.nodes[curr].prev;
    }
}

/**
 * Breadth first search algorithm implementation for leveled graph (used in Dinic's algorithm).
 * @param graph leveled graph
 * @param source start node
 * @param target identifier of node to be reached
 * @returns {boolean} true if target was reached, false otherwise
 */
function bfsLevel(graph, source, target) {
    graph.nodes.forEach(node => {
        node.dist = Number.MAX_VALUE;
        node.prev = -1;
    });

    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;
    // can't finish earlier, all nodes must have levels
    let targetReached = false;

    // create fifo
    let queue = new Queue();
    queue.push(source);

    while (!queue.empty()) {
        let v = graph.nodes[queue.pop()];

        if (v.key === target) {
            targetReached =  true;
        }
        v.adjacencyListResidual.forEach((node, key) => {
            node.toTarget = true;
            if (graph.nodes[node.key].dist === Number.MAX_VALUE && node.capacity > 0) {
                queue.push(node.key);
                graph.nodes[node.key].dist = v.dist + 1;
                graph.nodes[node.key].prev = v.key;
            }
        });
    }

    return targetReached;

}

/**
 * Depth first search algorithm recursive implementation.
 * Can stop after reaching a target node. Augments flow on the found path to target and accordingly
 * updates residual graph.
 *
 * @param graph graph to be explored
 * @param node node currently explored
 * @param source start node for exploration
 * @param target endpoint for exploration
 * @param flow current value of found flow
 * @returns {number} value of the found flow
 */
function dfsRecursive(graph, node, source, target, flow) {
    if (graph.nodes[node].key === target) {
        return flow;
    }

    for (const [key, neighbour] of graph.nodes[node].adjacencyListResidual.entries()) {
        if (neighbour.toTarget && neighbour.capacity > 0 && graph.nodes[node].dist + 1 === graph.nodes[neighbour.key].dist) {
            if (neighbour.capacity < flow) {
                flow = neighbour.capacity;
            }
            let min = dfsRecursive(graph, neighbour.key, source, target, flow);
            if (min > 0) {
                graph.nodes[node].adjacencyList.get(neighbour.key).flow += min;

                // update residual graph
                graph.nodes[neighbour.key].adjacencyListResidual.get(node).capacity += min;
                neighbour.capacity -= min;
                return min;
            } else {
                neighbour.toTarget = false;
            }
        }
    }

    return 0;
}

/**
 * Depth first search algorithm implementation modified to find alternating path to
 * augment matching (used in Hungarian algorithm).
 *
 * @param graph graph
 * @param source start point for alternating path
 * @param destination destination of alternating path to find
 * @param M current matching
 * @returns {[Integer]} array representing found alternating path
 */
function dfsGetPath(graph, source, destination, M) { // find alternating path
    let path = [];

    graph.nodes.forEach(node => {
        node.visited = false;
    });

    // source is not matched (root of tree) so the first edge will have to be unmatched
    explorePath(graph, source, destination, path, M, true); // explore paths from the source
    return path;
}

/**
 * Exploration based on DFS to find an alternating path to augment matching.
 *
 * @param graph graph
 * @param node current node to explore
 * @param destination target node identifier
 * @param path array of identifiers creating a path
 * @param M current matching
 * @param last indicates if last edge was in matching or not
 * @returns {boolean} true if path led to destination, false otherwise
 */
// last - true if previous edge was matched, false otherwise
function explorePath(graph, node, destination, path, M, last) {
    let toTarget = false;
    graph.nodes[node].visited = true;
    if (node === destination) {
        path.push(destination);
        return true;
    }
    graph.nodes[node].adjacencyList.forEach(neighbour => {
        if (!graph.nodes[neighbour.key].visited && (isInMatchingUndirected(M, node, neighbour.key) ^ last)) {
            toTarget ||= explorePath(graph, neighbour.key, destination, path, M, !last);
        }
    });

    if (toTarget) {
        path.push(node);
    }
    return toTarget;
}

/**
 * Function checks if given edge is in matching.
 *
 * @param M matching to be checked
 * @param x endpoint of edge
 * @param y endpoint of edge
 * @returns {boolean} true if edge is in matching, false otherwise
 */
function isInMatchingUndirected(M, x, y) {
    for (const pair of M) {
        if ((pair.source === x && pair.destination === y) || (pair.source === y && pair.destination === x)) {
            return true;
        }
    }
    return false;
}

/**
 * Bellman-Ford algorithm with FIFO to obtain distances to all nodes from source.
 * The function sets only distance labels, it does not set predecessor of node on the path.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 * @return true if there is no negative cycle in graph, false otherwise
 */
function fifoLabelCorrecting(graph, source) {
    // initialize
    graph.nodes.forEach(node => {
       node.dist = null;
       node.counter = 0;
    });
    graph.nodes[source].dist = 0;
    // create fifo
    let queue = new Queue();
    queue.push(source);

    while (!queue.empty()) {
        let v = graph.nodes[queue.pop()];
        v.counter++;
        if (v.counter > graph.vNo - 1) {
            return false; // negative cycle detected
        }
        v.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null || graph.nodes[neighbour.key].dist > v.dist + neighbour.cost)) {
                graph.nodes[neighbour.key].dist = v.dist + neighbour.cost;
                // add neighbour to the end of the queue
                queue.push(neighbour.key);
            }
        });
    }

    return true;
}

/**
 * Bellman-Ford algorithm with FIFO to obtain distances to all nodes from source in residual graph.
 * The function sets only distance labels, it does not set predecessor of node on the path.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 * @param target identifier of target node
 * @return true if there is no negative cycle in graph, false otherwise or if there was detected
 * negative cycle
 */
function fifoLabelCorrectingResidual(graph, source, target) {
    // initialize
    graph.nodes.forEach(node => {
        node.dist = null;
        node.counter = 0;
        node.prev = null;
    });
    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;
    // create fifo
    let queue = new Queue();
    queue.push(source);
    let reached = false;

    while (!queue.empty()) {
        let v = graph.nodes[queue.pop()];
        v.counter++;
        if (v.counter > graph.vNo - 1) {
            return false;
        }
        if (v.key === target) {
            reached = true;
        }
        v.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null || graph.nodes[neighbour.key].dist > v.dist + neighbour.cost)) {
                graph.nodes[neighbour.key].dist = v.dist + neighbour.cost;
                graph.nodes[neighbour.key].prev = v.key;
                // add neighbour to the end of the queue
                queue.push(neighbour.key);
            }
        });
    }

    return reached;
}

/**
 * Dial's algorithm implementation to obtain the shortest paths distances from given node
 * to all nodes in graph.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 * @param target identifier of target node
 * @return true target was reached, false otherwise
 */
// dial implementation, good if costs are not too high
function dialResidual(graph, source, target) {
    let reached = false;
    let max = getMaxCost(graph);
    let buckets = new CircularList(max);

    // initialization
    let permanent = 0;
    graph.nodes.forEach(node => {
        node.dist = null;
        node.prev = null;
    });
    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;
    buckets.addToBucket(graph.nodes[source].dist, source);

    // find the shortest path from source to target in residual graph
    while (!(permanent === graph.vNo || buckets.ifAllEmpty())) {
        buckets.nextNotEmptyBucket();

        // empty the bucket
        while (!buckets.isEmptyBucket()) {
            let node = buckets.extract();

            // dist of node is permanent
            permanent++;
            if (target === node) {
                reached = true; // target reached
            }
            // update
            graph.nodes[node].adjacencyListResidual.forEach(neighbour => {
                // if cost of this edge is === 0 then it means it is not in residual graph
                if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null
                    || graph.nodes[neighbour.key].dist > graph.nodes[node].dist + neighbour.cost)) {
                    let prev = graph.nodes[neighbour.key].dist;
                    graph.nodes[neighbour.key].dist = graph.nodes[node].dist + neighbour.cost;
                    graph.nodes[neighbour.key].prev = node;

                    // add to bucket or change bucket
                    if (prev === null) {
                        buckets.addToBucket(graph.nodes[neighbour.key].dist % (max + 1), neighbour.key);
                    } else {
                        // change buckets
                        buckets.deleteFromBucket(prev % (max + 1), neighbour.key);
                        buckets.addToBucket(graph.nodes[neighbour.key].dist % (max + 1), neighbour.key);
                    }
                }
            });
        }
        // change bucket (go to next not empty bucket)
    }
    return reached;
}

/**
 * Function to obtain maximum cost (weight) of edge in residual graph.
 *
 * @param graph graph
 * @returns {number} maximum cost in graph
 */
function getMaxCost(graph) {
    let max = 0;
    graph.nodes.forEach(node => {
       node.adjacencyListResidual.forEach(neighbour => {
           if (neighbour.cost > max) {
               max = neighbour.cost;
           }
       });
    });
    return max;
}

// used in cost scalling
// function getMinCost(graph) {
//     let min = null;
//     graph.nodes.forEach(node => {
//         node.adjacencyListResidual.forEach(neighbour => {
//             if (min === null || neighbour.cost < min) {
//                 min = neighbour.cost;
//             }
//         });
//     });
//     return min;
// }

/**
 * Bellman-Ford algorithm implementation to obtain the shortest path distance in residual graph.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 */
function bellmanFord(graph, source) {
    graph.nodes.forEach(node => {
        node.dist = null;
        node.counter = 0;
        node.prev = null;
    });

    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;
    for (let i = 0; i < graph.vNo; i++) {
        graph.nodes.forEach(node => {
           node.adjacencyListResidual.forEach(neighbour => {
              if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null || graph.nodes[neighbour.key].dist > node.dist + neighbour.cost)) {
                  graph.nodes[neighbour.key].dist = node.dist + neighbour.cost;
                  graph.nodes[neighbour.key].prev = node.key;
              }
           });
        });
    }

    graph.nodes.forEach(node => {
        node.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null || graph.nodes[neighbour.key].dist > node.dist + neighbour.cost)) {
                let iter = true;
                let curr = node.key;
                let prev = node.prev;
                while (iter < 7) {
                    console.log(curr);
                    curr = prev;
                    prev = graph.nodes[curr].prev;
                    iter++;
                }
                // return node.key;
            }
        });
    });
}

/**
 * FIFO label correcting algorithm to obtain the shortest path distances from given node to all
 * nodes in graph.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 * @returns {null|Integer} key of node on the found cycle, null if no cycle was found
 */
function fifoLabelCorrectingResidualNegativeCycle(graph, source) {
    // initialize
    graph.nodes.forEach(node => {
        node.dist = null;
        node.counter = 0;
        node.prev = null;
    });
    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;
    // create fifo
    let queue = new Queue();
    queue.push(source);
    while (!queue.empty()) {
        let v = graph.nodes[queue.pop()];
        v.counter++;
        if (v.counter > graph.vNo - 1) {
            // this node may be reachable from negative cycle but not in the cycle itself
            // hence the need to identify exactly the nodes in the cycle
            graph.nodes.forEach(node => {
                node.counter = 0;
            });
            let notFound = true;
            let curr = v.key;
            let prev = v.prev
            while (notFound) {
                graph.nodes[curr].counter++;
                if (graph.nodes[curr].counter > 1) {
                    notFound = false;
                } else {
                    curr = prev;
                    prev = graph.nodes[curr].prev;
                }
            }
            return curr; // negative cycle found, return the key of node
        }

        v.adjacencyListResidual.forEach(neighbour => {
            if (neighbour.capacity !== 0 && (graph.nodes[neighbour.key].dist === null || graph.nodes[neighbour.key].dist > v.dist + neighbour.cost)) {
                graph.nodes[neighbour.key].dist = v.dist + neighbour.cost;
                graph.nodes[neighbour.key].prev = v.key;
                // add neighbour to the end of the queue
                queue.push(neighbour.key);
            }
        });
    }

    return null; // no negative cycle found
}

// doesn't work
function dfs(graph, source, target) {
    let flow = 0;
    let stack = new Stack();
    let iteration = 0;
    // store on stack node and the number of iteration when it was pushed there
    stack.push({key: source, iteration: iteration});
    let nodeObj;
    let path = [];

    while (!stack.empty()) {
        iteration++;
        console.log("stack");
        console.log(stack);
        nodeObj = stack.pop();

        path.push(nodeObj);
        console.log("path");
        console.log(path)
        console.log("key ", nodeObj.key)

        if (graph.nodes[nodeObj.key].key === target) {
            // augment flow on the path
            let min = Number.MAX_VALUE;
            // find min capacity
            for (let i = 0; i < path.length - 1; i++) {
               // console.log(path[i])
                //console.log(graph.nodes[path[i].key].adjacencyListResidual)
                console.log("i " , i, " key ", path[i].key, " key + 1 ", path[i + 1].key);
                if (graph.nodes[path[i].key].adjacencyListResidual.get(path[i + 1].key).capacity < min) {
                    min = graph.nodes[path[i].key].adjacencyListResidual.get(path[i + 1].key).capacity;
                }
            }
            flow += min;
            if (min > 0 ) {
                // augment
                for (let i = 0; i < path.length - 1; i++) {
                    graph.nodes[path[i].key].adjacencyList.get(path[i + 1].key).flow += min;

                    // update residual graph
                    graph.nodes[path[i + 1].key].adjacencyListResidual.get(path[i].key).capacity += min;
                    graph.nodes[path[i].key].adjacencyListResidual.get(path[i + 1].key).capacity -= min;
                }
            } else {
                for (let i = 0; i < path.length - 1; i++) {
                    graph.nodes[path[i].key].adjacencyListResidual.get(path[i + 1].key).toTarget = false;
                }
            }

            // delete last steps from path to restore the state before 'branching'
            let toDelete = path[path.length - 1].iteration - stack.peek().iteration + 1;
            let pathOld = path;
            path = [];
            for (let i = 0; i < pathOld.length - toDelete; i++) {
                path.push(pathOld[i]);
            }
            console.log("new path")
            console.log(path)
            iteration = path[path.length - 1].iteration
        }

        let changed = false;
        for (const [key, neighbour] of graph.nodes[nodeObj.key].adjacencyListResidual.entries()) {
            console.log("neghbour ", neighbour.key , " of ", nodeObj.key)
            if (neighbour.toTarget && neighbour.capacity > 0 && graph.nodes[nodeObj.key].dist + 1 === graph.nodes[neighbour.key].dist) {
                stack.push({key: neighbour.key, iteration: iteration});
                changed = true;
                console.log("neghbour ", neighbour.key , " of ", nodeObj.key, "in if")
            }
        }

        if (!changed) {
            graph.nodes[path[path.length - 2].key].adjacencyListResidual.get(path[path.length - 1].key).toTarget = false;
        }
        console.log("stack after");
        console.log(stack);
    }

    return flow;
}

/**
 * Function to obtain reduced costs in residual network.
 *
 * @param graph graph with distances set
 */
function reduceCosts(graph) {
    graph.nodes.forEach(node => {
        node.adjacencyListResidual.forEach(neighbour => {
            //neighbour.cost = neighbour.cost + node.dist - graph.nodes[neighbour.key].dist;
            if (node.dist && graph.nodes[neighbour.key].dist) {
                neighbour.cost = neighbour.cost + node.dist - graph.nodes[neighbour.key].dist;
            } else {
               // neighbour.cost = -100
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

/**
 * Dijkstra algorithm implementation to obtain the shortest path distances on residual graph.
 * Implementation with priority queue on binary heap.
 *
 * @param graph graph
 * @param source identifier of node for which the distances of the shortest path are to be obtained
 * @param target identifier of target node
 * @return true target was reached, false otherwise
 */
function dijkstraResidual(graph, source, target) {
    let reached = false;
    graph.nodes.forEach(node => {
        node.dist = Number.MAX_VALUE;
        node.prev = null;
    });

    graph.nodes[source].dist = 0;
    graph.nodes[source].prev = source;

    let q = new PriorityQueueDecreaseKey(graph.vNo);
    graph.nodes.forEach(node => {
        q.insert(node.key, node.dist);
    });

    while (!q.empty()) {
        let u1 = q.extractMin();

        if (target !== null && target === u1.key) {
            reached = true;
        }

        graph.nodes[u1.key].adjacencyListResidual.forEach(neighbour => {
           if (neighbour.capacity > 0 && graph.nodes[neighbour.key].dist > graph.nodes[u1.key].dist + neighbour.cost) {
               graph.nodes[neighbour.key].dist = graph.nodes[u1.key].dist + neighbour.cost;
               graph.nodes[neighbour.key].prev = u1.key;

               q.changePriority(neighbour.key, graph.nodes[neighbour.key].dist);
           }
        });
    }

    return reached;
}

module.exports = {
    bfsResidual,
    bfsLevel,
    updateResidualCapacities,
    updateResidualCapacitiesCycle,
    dfs,
    dfsRecursive,
    dfsGetPath,
    fifoLabelCorrecting,
    dialResidual,
    fifoLabelCorrectingResidual,
    getMaxCost,
    fifoLabelCorrectingResidualNegativeCycle,
    bellmanFord,
    reduceCosts,
    dijkstraResidual
}