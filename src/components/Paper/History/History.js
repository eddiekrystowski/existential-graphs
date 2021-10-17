

export default class History {
    constructor() {
        this.data = [];
        this.index = 0;
        this.MAX_SIZE = 1024;
        this.locked = false;
        this.batch_mode = false;
        this.batch_state = null;
    }

    push(item) {
        if(this.locked) return;

        if(this.batch_mode) {
            this.batch_state = item;
            return;
        }

        if (this.index !== this.data.length - 1) {
            this.diverge();
        }
        this.data.push(item);
        //remove from bottom of stack if we have more items than the max size allows
        if (this.data.length >= this.MAX_SIZE) {
            this.data.shift();
        }
        this.index = this.data.length - 1;
    }

    undo() {
        if (this.index > 0) this.index -= 1;
        return this.getState();
    }

    redo() {
        if (this.index < this.data.length - 1) this.index += 1;
        return this.getState();
    }

    getState() {
        return this.data[this.index];
    }

    diverge() {
        //remove all states after the current index
        this.data.splice(this.index + 1);
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    startBatch() {
        this.batch_mode = true;
        this.batch_state = null;
    }

    endBatch() {
        this.batch_mode = false;
        if (this.batch_state !== null) this.push(this.batch_state);
    }

}