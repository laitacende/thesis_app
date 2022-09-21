const Queue = require("../structures/Queue");
const PriorityQueueDecreaseKeyMax = require("../structures/PriorityQueueDecreaseKeyMax");
const PriorityQueueMax = require("../structures/PriorityQueueMax");

/**
 * Solves maximum bipartite weighted matching.
 * Auction algorithm implementation based on https://agtb.wordpress.com/2009/07/13/auction-algorithm-for-bipartite-matching/.
 * Maximum c_{ij} - p_j is obtained by O(n/2) algorithm.
 *
 * Time complexity:
 * Maximum price some item can obtain is C = max_{i,j} w_{i,j}, in that case
 * it is equal to 10.
 * Total number of iterations is at most O(Cn^2)= = O(10n^2).
 * One loop takes O(n/2) time.
 * Overall O(10n^2*n/2) = O(n^3).
 *
 * @param graph bipartite graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
// based on https://agtb.wordpress.com/2009/07/13/auction-algorithm-for-bipartite-matching/
// and https://resources.mpi-inf.mpg.de/departments/d1/teaching/ws09_10/Opt2/handouts/lecture1.pdf
function auctionAlgorithm(graph) {
   // owners are the nodes from the first set and goods are the nodes from the second set
    let half = graph.vNo / 2 - 1;
    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].price = 0;
        graph.nodes[i].owner = null;
    }

    let queue = new Queue();
    // add bidders
    for (let i = 0; i <= half; i++) {
        queue.push(i);
    }

    let delta = 1 / (graph.vNo / 2 + 1);

    let bidder;
    while(!queue.empty()) {
        bidder = queue.pop();

        // get j that maximizes cij - pj
        let max = null;
        let indexMax;
        graph.nodes[bidder].adjacencyList.forEach(neighbour => {
           if (max === null || max < neighbour.cost - graph.nodes[neighbour.key].price) {
               max = neighbour.cost - graph.nodes[neighbour.key].price;
               indexMax = neighbour.key;
           }
        });

        if (max >= 0) {
            if (graph.nodes[indexMax].owner !== null) {
                // enqueue current owner
                queue.push(graph.nodes[indexMax].owner);
            }
            graph.nodes[indexMax].owner = bidder;
            graph.nodes[indexMax].price += delta;
        }
    }

    // get matching from pairs (j, owner of j)
    let M = new Set();
    for (let i = half + 1; i < graph.vNo; i++) {
        M.add({source: graph.nodes[i].owner, destination: i});
    }
    return M;
}

/**
 * Auction algorithm implementation based on https://agtb.wordpress.com/2009/07/13/auction-algorithm-for-bipartite-matching/.
 * Each bidder has a priority queue, where priority is c_{ij} - p_j - used to obtain maximum in O(1).
 *
 * Time complexity:
 * Building a heap O(n/2).
 * Maximum price some item can obtain is C = max_{i,j} w_{i,j}, in that case
 * it is equal to 10.
 * Total number of iterations is at most O(Cn^2)= = O(10n^2).
 * One loop takes: obtaining max O(1), changing priority is O(n/2 + log(n/2)).
 * Overall time complexity is O(n/2 + 10n^2(n/2 + log(n/2) + 1) = O(10n^3/2 + 10n^2log(n/2) + 10n^2)=O(n^3).
 *
 * @param graph bipartite directed graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
function auctionAlgorithmPriorityQueue(graph) {
    // owners are the nodes from the first set and goods are the nodes from the second set
    let half = graph.vNo / 2 - 1;
    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].price = 0;
        graph.nodes[i].owner = null;
    }

    let queue = new Queue();
    // add bidders
    for (let i = 0; i <= half; i++) {
        queue.push(i);
    }

    let delta = 1 / (graph.vNo / 2 + 1);

    let bidder;
    let biddersQueues = new Array(graph.vNo / 2);
    // initialize
    for (let i = 0; i < biddersQueues.length; i++) {
        biddersQueues[i] = new PriorityQueueMax(half + 1); // this many goods
        for (let j = half + 1; j < graph.vNo; j++) {
            biddersQueues[i].insert(j, graph.nodes[i].adjacencyList.get(j).cost);
        }
    }

    while(!queue.empty()) {
        bidder = queue.pop();

        let priorityNode = biddersQueues[bidder].top();
        let indexMax = priorityNode.key;

        if (priorityNode.priority >= 0) {
            if (graph.nodes[indexMax].owner !== null) {
                // enqueue current owner
                queue.push(graph.nodes[indexMax].owner);
            }
            graph.nodes[indexMax].owner = bidder;
            graph.nodes[indexMax].price += delta;

            // update on list of all owners
            for (let i = 0; i <= half; i++) {
                biddersQueues[i].changePriority(indexMax, graph.nodes[i].adjacencyList.get(indexMax).cost - graph.nodes[indexMax].price);
            }
        }
    }

    // get matching from pairs (j, owner of j)
    let M = new Set();
    for (let i = half + 1; i < graph.vNo; i++) {
        M.add({source: graph.nodes[i].owner, destination: i});
    }
    return M;
}

/**
 * Auction algorithm implementation based on https://agtb.wordpress.com/2009/07/13/auction-algorithm-for-bipartite-matching/.
 * Each bidder has a priority queue, where priority is c_{ij} - p_j - used to obtain maximum in O(1).
 * Priority queue with map to speed up changing priority operation.
 *
 * Time complexity of Map should be sublinear.
 * Time complexity:
 * Building a heap O(n/2).
 * Maximum price some item can obtain is C = max_{i,j} w_{i,j}, in that case
 * it is equal to 10.
 * Total number of iterations is at most O(Cn^2)= = O(10n^2).
 * One loop takes: obtaining max O(1), changing priority is O(log(n/2)).
 * Overall time complexity is O(n/2 + 10n^2(log(n/2) + 1) = O(10n^2log(n/2) + 10n^2) = O(10n^2log(n/2)).
 *
 * @param graph bipartite directed graph with nonnegative costs, first set indices 0..(n - 1), second set n..(2n - 1)
 * @returns {Set<any>} matching in form of pairs {source: key, destination: key}
 */
function auctionAlgorithmPriorityQueueDecreaseKey(graph) {
    // owners are the nodes from the first set and goods are the nodes from the second set
    let half = graph.vNo / 2 - 1;
    for (let i = half + 1; i < graph.vNo; i++) {
        graph.nodes[i].price = 0;
        graph.nodes[i].owner = null;
    }

    let queue = new Queue();
    // add bidders
    for (let i = 0; i <= half; i++) {
        queue.push(i);
    }

    let delta = 1 / (graph.vNo / 2 + 1);

    let bidder;
    let biddersQueues = new Array(graph.vNo / 2);
    // initialize
    for (let i = 0; i < biddersQueues.length; i++) {
        biddersQueues[i] = new PriorityQueueDecreaseKeyMax(half + 1); // this many goods
        for (let j = half + 1; j < graph.vNo; j++) {
            biddersQueues[i].insert(j, graph.nodes[i].adjacencyList.get(j).cost);
        }
    }

    while(!queue.empty()) {
        bidder = queue.pop();

        let priorityNode = biddersQueues[bidder].top();
        let indexMax = priorityNode.key;

        if (priorityNode.priority >= 0) {
            if (graph.nodes[indexMax].owner !== null) {
                // enqueue current owner
                queue.push(graph.nodes[indexMax].owner);
            }
            graph.nodes[indexMax].owner = bidder;
            graph.nodes[indexMax].price += delta;

            // update on list of all owners
            for (let i = 0; i <= half; i++) {
                biddersQueues[i].changePriority(indexMax, graph.nodes[i].adjacencyList.get(indexMax).cost - graph.nodes[indexMax].price);
            }
        }
    }

    // get matching from pairs (j, owner of j)
    let M = new Set();
    for (let i = half + 1; i < graph.vNo; i++) {
        M.add({source: graph.nodes[i].owner, destination: i});
    }
    return M;
}

module.exports = {
    auctionAlgorithm,
    auctionAlgorithmPriorityQueue,
    auctionAlgorithmPriorityQueueDecreaseKey
};