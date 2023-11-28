



export default class ExistentialHypergraphNode {
    constructor(cells, json) {
        this.cells = cells;
        this.json = JSON.parse(JSON.stringify(json));

        console.log('CREATED WITH JSON', this.json);

        this.parent = null;
        this.next = [];

        this.verified = false;
    }

    addTransition(rule, cells, json) {
        const destinationNode = new ExistentialHypergraphNode(cells, json);
        this.next.push({
            rule, 
            destination: destinationNode,
        });

        return destinationNode;
    }

    
}