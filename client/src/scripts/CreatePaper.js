import Paper from '@root/existential-graph/ExistentialGraph';

export default class CreatePaper extends Paper {
    constructor(dom_id, graph_id) {
        super(dom_id, graph_id);
        this.paper.setInteractivity(true);
    }
}