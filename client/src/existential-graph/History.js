import { LinkedList } from "./LinkedList";

/**
 *  A series of phyiscal changes to the graph. 
 */

class History {
    constructor() {
        this.history = new LinkedList();
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