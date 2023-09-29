import Paper from './Paper';

export default class CreatePaper extends Paper {
    constructor(dom_id, graph_id) {
        super(dom_id, graph_id);
        this.jpaper.setInteractivity(true);
    }
}