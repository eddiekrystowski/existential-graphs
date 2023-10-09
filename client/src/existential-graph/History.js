import { Queue } from "./Queue";

/**
 *  A series of phyiscal changes to the graph. 
 */

class History {
    constructor() {
        this.history = new Queue();
    }

    undo()
    {
        // TODO
        this.history.pop()
    }

    do(action)
    {
        // TODO
        this.history.push(action);
    }
}