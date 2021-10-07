import React from 'react';
import * as joint from 'jointjs'
import E from '../../EventController.js';
import _ from 'lodash';

import { findRoot } from '../../util/treeUtil';
import { treeToFront } from '../../util/collisions';
import { addSubgraph } from '../../util/otherUtil.js';

import Delete from '../../sounds/delete.wav';
import { Cut } from '../../shapes/Cut/Cut.js';
import { Premise } from '../../shapes/Premise/Premise.js';
import Graph from './Graph/Graph.js';

const PAPER_SIZE = { width: 4000, height: 4000 };

// const NSPremise = joint.dia.Element.define('nameSpace.Premise',Premise);
// const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);

export default class Paper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.graph = new Graph(this);
        this.jpaper = null;
        this.paper_element = null;
    
        this.selected_premise = null;
        this.saved_template = null;
        this.temp_cut = null;
        this.initial_cut_pos = {x: 0, y: 0};

        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    componentDidMount() {
        this.jpaper = new joint.dia.Paper({
            el: document.getElementById(this.props.id),
            model: this.graph.jgraph,
            width: PAPER_SIZE.width,
            height: PAPER_SIZE.height,
            preventContextMenu: false,
            clickThreshold: 1
        });

        this.paper_element = document.getElementById(this.props.id);
        this.paper_element.focus();

        this.setPaperEvents();
    }

    setPaperEvents(){
        // paper events
        //arrow functions are required to keep proper this context binding
        this.jpaper.on("element:mouseenter", ( cellView, evt) =>{
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            modelView.showTools()
            model.attr("rect/stroke", "red")
            model.attr("text/fill", "red")
            this.selected_premise = model
        })

        this.jpaper.on("element:mouseleave", ( cellView, evt) =>{
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            if(!modelView) return;
            modelView.hideTools()
            model.attr("rect/stroke", "black")
            model.attr("text/fill", "black")
            this.selected_premise = undefined;
        })

        // First, unembed the cell that has just been grabbed by the user.
        this.jpaper.on('cell:pointerdown', (cellView, evt, x, y) => {
            
            let cell = cellView.model;

            if (!cell.get('embeds') || cell.get('embeds').length === 0) {
                // Show the dragged element above all the other cells (except when the
                // element is a parent).
                cell.toFront();
            }
            
            if (cell.get('parent')) {
                this.graph.jgraph.getCell(cell.get('parent')).unembed(cell);
            }

            cell.active();
            this.graph.treeToFront(this.graph.findRoot(cell));
        });

        // When the dragged cell is dropped over another cell, let it become a child of the
        // element below.
        this.jpaper.on('cell:pointerup', (cellView, evt, x, y) => {

            let cell = cellView.model;
            
            this.graph.handleCollisions(cell)
            cell.inactive();

            if (window.action) window.action(cell);
            window.action = null;
        });
    }

    handleClick() {
        console.log('clicked', this);
    }

    handleKeyDown() {
        if(window.mode === 'create'){
            if (E.keys[16]) {
                this.jpaper.setInteractivity(false);
            }
        }
    }

    handleKeyUp(event) {
        console.log('keyup', this);
        if(window.mode === 'proof'){
            if(window.action && window.action.name === 'inferenceInsertion') {
                if (!this.selected_premise) return;
                if (this.selected_premise.attributes.attrs.level % 2 === 1) return;
                if (event.keyCode >= 65 && event.keyCode <= 90) {
                    let config = {
                        //use capital letters by default, can press shift to make lowercase
                        attrs:{
                            text: {
                                text:event.shiftKey ? event.key.toLocaleLowerCase() : event.key.toLocaleUpperCase()
                            }
                        },
                        position: this.getRelativeMousePos()
                    }
                    this.graph.addPremise(config);
                }
                window.action = null;
            }
            return;
        }
        let key = E.key
        //backspace (delete premise or cut)
        if (E.isActive('backspace') ) {
            if (this.selected_premise) {
                let delete_noise = new Audio(Delete); 
                if (this.selected_premise.attributes.type === "dia.Element.Premise") {
                    this.selected_premise.destroy()
                    delete_noise.play();
                } else if (this.selected_premise.attributes.type === "dia.Element.Cut") {
                    this.selected_premise.destroy();        // Play pop sound
                    delete_noise.play();
                } else {
                    console.error("attempted to delete shape of unknown type: " + this.selected_premise.attributes.type)
                }
            }
            this.selected_premise = null;
        }
        //a-z for creating premise
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            let config = {
                //use capital letters by default, can press shift to make lowercase
                attrs:{
                    text: {
                        text:event.shiftKey ? key.toLocaleLowerCase() : key.toLocaleUpperCase()
                    }
                },
                position: this.getRelativeMousePos()
            }
            //eslint-disable-next-line
            //let new_rect = new Premise().create(config)
            this.graph.addPremise(config);
        }
        //ENTER
        // new cut
        if (event.keyCode === 13) {
            let config = {
                position: this.getRelativeMousePos()
            }
            if (this.selected_premise) {
                config["child"] = this.selected_premise;
                this.graph.addCut(config);
            } else {
                console.log("creating empty cut")
                const new_cut = this.graph.addCut(config);
                console.log("cut", new_cut)
            }
        }
    
        if (event.keyCode === 49) {
            //save template
            if (this.selected_premise) {
                this.saved_template = this.graph.cloneSubgraph([this.selected_premise], {deep: true});
            }
        }
    
        if (event.keyCode === 50) {
            const mouse_adjusted = this.getRelativeMousePos();
            console.log("position", mouse_adjusted)
            if (this.saved_template) {
                this.graph.addSubgraph(this.saved_template, mouse_adjusted);
            }
        }
        event.preventDefault()
    }

    handleMouseDown(event) {
        console.log('mousedown', this);
        if (E.keys[16] && window.mode === 'create') {
            this.initial_cut_pos = Object.assign({}, E.mousePosition);
            this.initial_cut_pos.x -= this.paper_element.getBoundingClientRect().left;
            this.initial_cut_pos.y -= this.paper_element.getBoundingClientRect().top;
            let config  = {
                position: Object.assign({}, this.initial_cut_pos),
                size: {width: 0, height: 0}
            }
            //this.temp_cut = new Cut().create(config);
            this.temp_cut = this.graph.addCut(config);
            this.temp_cut.active();
            event.preventDefault();
            console.log("CREATED TEMP CUT", this.temp_cut);
        }
    }

    handleMouseUp() {
        console.log('mouseup', this);
        if (window.mode === 'proof') {
            if (!this.selected_premise && window.action && window.action.name === 'insertDoubleCut') {
                const mouse_adjusted = this.getRelativeMousePos();
                window.action(null, mouse_adjusted);
                window.action = null;
            }
        }
        if (this.temp_cut && window.mode === 'create') {
            const position = _.clone(this.temp_cut.get('position'));
            const size = _.clone({width: this.temp_cut.attr('rect/width'), height: this.temp_cut.attr('rect/height')});
            const config = {
                position: position,
                attrs:{
                    rect: {
                        ...size
                    }
                }
            }
            //eslint-disable-next-line
            //let new_rect = new Cut().create(config);
            this.graph.addCut(config);
            this.temp_cut.remove();
            console.log('mouse released, deleting temp cut...');
        }
    
        this.jpaper.setInteractivity(true);
        this.temp_cut = null;
    }

    handleMouseMove() {
        //console.log('mousemove', this);
        if(window.mode === 'create'){
            //console.log(E.isMouseDown);
            if (E.isMouseDown && E.keys[16] && this.temp_cut) {
                const mouse_adjusted = this.getRelativeMousePos();
                this.temp_cut.set('position', {
                    x: Math.min(mouse_adjusted.x, this.initial_cut_pos.x),
                    y: Math.min(mouse_adjusted.y, this.initial_cut_pos.y)
                });
                this.temp_cut.attr('rect/width', Math.abs(mouse_adjusted.x - this.initial_cut_pos.x));
                this.temp_cut.attr('rect/height', Math.abs(mouse_adjusted.y - this.initial_cut_pos.y));
            }
        }
    }

    getRelativeMousePos() {
        return {
            x: E.mousePosition.x - this.paper_element.getBoundingClientRect().left,
            y: E.mousePosition.y - this.paper_element.getBoundingClientRect().top
        };
    }

    render() {
        return(
            <div class="paper-root">
                <div class="paper-wrapper">
                    <div 
                        id={this.props.id}
                        class="joint-paper"
                        onClick={this.handleClick}
                        onKeyDown={this.handleKeyDown}
                        onKeyUp={(event) => this.handleKeyUp(event)}
                        onMouseDown={(event) => this.handleMouseDown(event)}
                        onMouseUp={this.handleMouseUp}
                        onMouseMove={this.handleMouseMove}
                        tabIndex="0"
                    ></div>
                </div>
            </div>
        );
    }
}