import React from "react";
import _ from 'lodash';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";

import './History.css';
import HistoryItem from "./HistoryItem";

export default class History extends React.Component {
    constructor(props) {
        super(props);

        this.MAX_SIZE = 1024;

        this.batch_mode = false;
        this.batch_state = false;
        this.locked = false;


        this.state = {
            data: [],
            index: 0
        }
    }

    handleJump = (num) => {
        this.setState({
            index: num
        });
        this.props.handleHistoryJump(this.getItem(num));
    }

    clear(callback) {
        this.setState({
            data: [],
            index: 0
        }, callback && callback);
    }

    push(item) {
        if(this.locked) return;

        if(this.batch_mode) {
            this.batch_state = item
            return;
        }

        const data = [...this.state.data];

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

    getItem(index) {
        return this.state.data[index];
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
        if (this.batch_state !== null) {
            this.push(this.batch_state);
        }
    }

    render() {
        return (
            <div class="history">
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