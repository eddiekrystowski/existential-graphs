
import ExistentialHypergraphNode from "./ExistentialHypergraphNode";


/**
 * Existential Hypergraphs are directed graphs in which the nodes represent Existential Graphs and the edges represent applications
 * of logical rules to transition from one graph to another.
 * 
 * We represent proofs using Existential Hypergraphs
 */
export default class ExistentialHypergraph {
    constructor(rootGraph)
    {
        this.root = new ExistentialHypergraphNode(rootGraph);
        this.ptr = this.root;
    }

    addStep(graphId, rule, destination) {
        //const hypergraphNode = this.find(graphId);
        //if (hypergraphNode) {
        this.ptr = this.ptr.addTransition(rule, destination);
        ////}
    }

    toArray() {

        let current = this.root;
        const result = [{rule: "Start", verified: true}];

        while (current.next.length) {
            result.push({
                rule: current.next[0].rule,
                verified: current.next[0].verified
            });

            current = current.next[0].destination;

        }

        console.log('TO ARRAY', result)

        return result;

    }

    find(graphId) {
        let current = [this.root]
        while(current.length > 0) {
            let next = []
            for (let node of current) {
                console.log('searching node...', node)
                if (node.existentialGraph.id === graphId)
                    return node;
                next.push(...node.next);
            }
            
            current = next;
        }

        return null;
    }
}