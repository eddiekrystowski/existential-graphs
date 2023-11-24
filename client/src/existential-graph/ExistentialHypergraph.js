
/**
 * Existential Hypergraphs are directed graphs in which the nodes represent Existential Graphs and the edges represent applications
 * of logical rules to transition from one graph to another.
 * 
 * We represent proofs using Existential Hypergraphs
 */
export default class ExistentialHypergraph {
    constructor(rootGraph)
    {
        this.root = rootGraph;
    }

    addStep(graphId, rule, destination) {
        const hypergraphNode = this.find(graphId);
        if (hypergraphNode)
            hypergraphNode.addTransition(rule, destination);
    }

    find(graphId) {
        const current = [this.root]
        while(current.length > 0) {
            let next = []
            for (let graph of current) {
                if (graph.id === graphId)
                    return graph;
                next.push(...graph.next);
            }
            
            current = next;
        }

        return null;
    }
}