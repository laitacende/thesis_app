const Queue = require("../structures/Queue");

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

        // TODO maybe add priority queue for each bidder and thus get the good faster
        // or lists (but then is it needed to find updated item on list...)
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

module.exports = {
    auctionAlgorithm
};