import React from "react";

import './History.css';
import HistoryItem from "./HistoryItem";

/**
 * This class manages and renders the timeline for the main workspace.
 * See components/Paper/History/HistoryItems.jsx for the individual timeline components
 */
export default class History extends React.Component {
    constructor(props) {
        super(props);

        //if MAX_SIZE is exceeded, will start removing from bottom of stack
        this.MAX_SIZE = 1024;

        // The idea of batch mode is to allow multiple premises/cuts to be added at once,
        // but only count it as one HistoryItem on the timeline
        //
        // this.batch_mode simply toggles this behavior on and off, but should NOT be set directly.
        // Instead, use this.startBatch() and this.endBatch().
        this.batch_mode = false;
        // this.batch_state reflects the cells that were most recently pushed while batch_mode is true.
        // Callling this.endBatch() will create a HistoryItem using this.batch_state cells.
        // Never set this manually, use this.push(item)
        this.batch_state = false;

        // if this.locked is true, no items will be able to be added to this.state.data,
        // so no new HistoryItems can be created
        this.locked = false;


        this.state = {
            //simple stack, each item is a collection of cells to be rendered by the paper 
            //of the respective HistoryItem component
            data: [],

            //index represents the index of the current HistoryItem being viewed in the data array.
            //For example, index = this.data.length - 1 is always the last thing you have done (present)
            //             index = 0 is always the first thing you have done (except for MAX_SIZE overflow)   
            index: 0
        }
    }

    /**
     * Call handler function on paper (passed through props) when multiple HistoryItems are 
     * skipped at a time (through clicking).
     * @param {int} num index to jump to
     */
    handleJump = (num) => {
        this.setState({
            index: num
        });
        this.props.handleHistoryJump(this.getItem(num));
    }

    /**
     * Clears the History timeline.
     * @param {function} callback function to be executed after data has been emptied
     */
    clear(callback) {
        this.setState({
            data: [],
            index: 0
        }, callback && callback);
    }


    /**
     * Adds collection of cells to data stack at the current index of the History timeline.
     * 
     * Any entries after the current index will be erased since we only maintain one branch of history.
     * 
     * If the size of the stack exceeds MAX_SIZE, the oldest entry will be deleted to make space.
     * __RETURNS EARLY__ if this.locked is true.
     * @param {*} item 
     * @returns 
     */
    push(item) {
        if(this.locked) return;

        if(this.batch_mode) {
            this.batch_state = item
            return;
        }

        //create a copy of state data (necessary since react state must be immutable, cant change it directly)
        const data = [...this.state.data];

        // if we aren't on the last HistoryItem (the present/most recent)
        if (this.state.index !== this.state.data.length - 1) {
            //remove all states after current index
            data.splice(this.state.index + 1);
        }

        data.push(item);

        //remove from bottom of stack if we have more items than the max size allows
        if (data.length >= this.MAX_SIZE) {
            data.shift();
        }

        this.setState({
            data: data,
            index: data.length - 1
        });
    }


    /**
     * Moves index of current HistoryItem to previous HistoryItem if there is one
     * @returns HistoryItem at the previous index if undoing is allowed, false otherwise
     */
    undo() {
        let index = this.state.index;
        if (this.state.index > 0) {
            this.setState({
                index: this.state.index - 1
            });
            index -= 1;
            return this.getItem(index);
        }
        return false;
    }

    /**
     * Moves index of current HistoryItem to subsequent HistoryItem if there is one
     * @returns HistoryItem at the subsequent index if redoing is allowed, false otherwise
     */
    redo() {
        let index = this.state.index;
        if (this.state.index < this.state.data.length - 1) {
            this.setState({
                index: this.state.index + 1
            });
            index += 1;
            return this.getItem(index);
        }
        return false;
    }

    /**
     * Gets a HistoryItem at a given index
     * @param {int} index 
     * @returns HistoryItem at a given index if the index is valid, null otherwise
     */
    getItem(index) {
        if (index < 0 || index >= this.state.data.length) {
            console.error(`ERROR: Tried to get HistoryItem this.state.data[${index}], index must be ${0} < ${index} <= ${this.state.data.length}`);
            return null;
        }
        return this.state.data[index];
    }

    /**
     * Locks the History so new HistoryItems cannot be added
     */
    lock() {
        this.locked = true;
    }

    /**
     * Unlocks the History so new HistoryItems can be added
     */
    unlock() {
        this.locked = false;
    }

    /**
     * Initializes a batch HistoryItem.
     * 
     * Will make the History keep track of the most recent state sent to it through `this.push(item)`
     * but will not actually update the History with that new item. 
     * 
     * `(see this.endBatch() for more info)`
     */
    startBatch() {
        this.batch_mode = true;
        this.batch_state = null;
    }

    /**
     * Adds a batch HistoryItem to the History.
     * 
     * Will take changes since `this.startBatch()` was called and add them to the History in one HistoryItem
     */
    endBatch() {
        this.batch_mode = false;
        if (this.batch_state !== null) {
            this.push(this.batch_state);
        }
    }

    render() {
        return (
            <div className="history">
                {
                    this.state.data.map((history_item, num) => (
                        (num === 0) ?  null :
                        <HistoryItem 
                            num={num}
                            total={this.state.data.length}
                            id={this.props.id_prefix + num}
                            cells={history_item}
                            active={this.state.index === num}
                            onClick={this.handleJump.bind(this, num)}
                            key={num}
                        />
                    ))
                }
            </div>
        );
    }
}