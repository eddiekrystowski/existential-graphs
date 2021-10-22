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


        this.state = {
            data: [],
            index: 0,
            locked: false
        }
    }

    push(item) {
        if(this.state.locked) return;

        if(this.batch_mode) {
            this.setState({
                batch_state: item
            });
            return;
        }

        const data = _.cloneDeep(this.state.data);

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
        }
        return this.getItem(index);
    }

    redo() {
        let index = this.state.index;
        if (this.state.index < this.state.data.length - 1) {
            this.setState({
                index: this.state.index + 1
            });
            index += 1;
        }
        return this.getItem(index);
    }

    getItem(index) {
        return this.state.data[index];
    }

    lock() {
        this.setState({
            locked: true
        });
    }

    unlock() {
        this.setState({
            locked: false
        });
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
                        <HistoryItem id={this.props.id_prefix + num}json={history_item}/>
                    ))
                }
            </div>
        );
    }
}