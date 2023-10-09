

export default class ExistentialHypergraphNode {
    constructor(existentialGraph) {
        this.value = existentialGraph;

        this.parent = null;
        this.next = [];
    }

    addTransition(rule, destination) {
        this.next.push({
            rule, 
            destination: new ExistentialHypergraphNode(destination)
        });
    }

    
}