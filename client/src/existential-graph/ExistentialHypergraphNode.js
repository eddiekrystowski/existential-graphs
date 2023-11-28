

export default class ExistentialHypergraphNode {
    constructor(existentialGraph) {
        this.existentialGraph = existentialGraph;

        this.parent = null;
        this.next = [];

        this.verified = false;
    }

    addTransition(rule, destination) {
        const destinationNode = new ExistentialHypergraphNode(destination);
        this.next.push({
            rule, 
            destination: destinationNode
        });

        return destinationNode;
    }

    
}