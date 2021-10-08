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
import Sheet from './Sheet/Sheet.js';

import './Paper.css';   

const PAPER_SIZE = { width: 4000, height: 4000 };

// const NSPremise = joint.dia.Element.define('nameSpace.Premise',Premise);
// const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);

export default class Paper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.sheet = new Sheet(this);
        this.jpaper = null;
        this.paper_element = null;
    
        this.selected_premise = null;
        this.saved_template = null;
        this.temp_cut = null;
        this.initial_cut_pos = {x: 0, y: 0};

        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
    }

    componentDidMount() {
        this.jpaper = new joint.dia.Paper({
            el: document.getElementById(this.props.id),
            model: this.sheet.graph,
            width: PAPER_SIZE.width,
            height: PAPER_SIZE.height,
            preventContextMenu: false,
            clickThreshold: 1
        });

        this.paper_element = document.getElementById(this.props.id);

        this.setPaperEvents();
    }

    //assume that if there is no workspace associated then we are in create mode
    getMode() {
        return this.props.mode || 'create';
    }

    setupModalPaper() {
        this.sheet.graph.clear();
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
                this.sheet.graph.getCell(cell.get('parent')).unembed(cell);
            }

            cell.active();
            this.sheet.treeToFront(this.sheet.findRoot(cell));
        });

        // When the dragged cell is dropped over another cell, let it become a child of the
        // element below.
        this.jpaper.on('cell:pointerup', (cellView, evt, x, y) => {

            let cell = cellView.model;
            
            this.sheet.handleCollisions(cell)
            cell.inactive();

            if (this.props.action) this.props.action(this.sheet, cell);
            if (this.props.handleClearAction) this.props.handleClearAction();
        });

        if (this.props.isModalPaper) {
            this.paper_element.addEventListener('load-modal', () => {
               this.sheet.graph.clear(); 
            });
        }
    }

    onClick() {
        console.log('clicked', this);
        if (this.getMode() === 'proof' && this.props.action && this.props.action.name === 'inferenceInsertion') {
            const mousePosition = Object.assign({}, E.mousePosition);
            this.props.action(this.sheet, mousePosition);
            this.props.handleClearAction();
        }
    }

    onKeyDown() {
        if(this.getMode() === 'create'){
            if (E.keys[16]) {
                this.jpaper.setInteractivity(false);
            }
        }
    }

    onKeyUp(event) {
        console.log('keyup', this);
        if(this.getMode() === 'proof'){
            console.log('here?')
            //TODO: REPLACE THIS WITH AN INTERFACE TO INSERT ANY SUBGRAPH, currently this only lets you insert a single premise
            // if(this.props.action && this.props.action.name === 'inferenceInsertion') {
            //     console.log("HEREEEee");
            //     if (!this.selected_premise) return;
            //     if (this.selected_premise.attributes.attrs.level % 2 === 1) return;
            //     console.log("HERE")
            //     if (event.keyCode >= 65 && event.keyCode <= 90) {
            //         let config = {
            //             //use capital letters by default, can press shift to make lowercase
            //             attrs:{
            //                 text: {
            //                     text:event.shiftKey ? event.key.toLocaleLowerCase() : event.key.toLocaleUpperCase()
            //                 }
            //             },
            //             position: this.getRelativeMousePos()
            //         }
            //         this.sheet.addPremise(config);
            //     }
            //     this.props.handleClearAction();
            // }
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
            this.sheet.addPremise(config);
        }
        //ENTER
        // new cut
        if (event.keyCode === 13) {
            let config = {
                position: this.getRelativeMousePos()
            }
            if (this.selected_premise) {
                config["child"] = this.selected_premise;
                this.sheet.addCut(config);
            } else {
                console.log("creating empty cut")
                const new_cut = this.sheet.addCut(config);
                console.log("cut", new_cut)
            }
        }
    
        if (event.keyCode === 49) {
            //save template
            if (this.selected_premise) {
                this.saved_template = this.sheet.cloneSubgraph([this.selected_premise], {deep: true});
            }
        }
    
        if (event.keyCode === 50) {
            const mouse_adjusted = this.getRelativeMousePos();
            console.log("position", mouse_adjusted)
            if (this.saved_template) {
                this.sheet.addSubgraph(this.saved_template, mouse_adjusted);
            }
        }
        event.preventDefault()
    }

    onMouseDown(event) {
        console.log('mousedown', this);
        if (E.keys[16] && this.getMode() === 'create') {
            this.initial_cut_pos = Object.assign({}, E.mousePosition);
            this.initial_cut_pos.x -= this.paper_element.getBoundingClientRect().left;
            this.initial_cut_pos.y -= this.paper_element.getBoundingClientRect().top;
            let config  = {
                position: Object.assign({}, this.initial_cut_pos),
                size: {width: 0, height: 0}
            }
            //this.temp_cut = new Cut().create(config);
            this.temp_cut = this.sheet.addCut(config);
            this.temp_cut.active();
            event.preventDefault();
            console.log("CREATED TEMP CUT", this.temp_cut);
        }
    }

    onMouseUp() {
        console.log('mouseup', this);
        if (this.getMode() === 'proof') {
            console.log('yuh');
            if (!this.selected_premise && this.props.action && this.props.action.name === 'insertDoubleCut') {
                const mouse_adjusted = this.getRelativeMousePos();
                this.props.action(this.sheet, null, mouse_adjusted);
                this.props.handleClearAction();
            }
        }
        if (this.temp_cut && this.getMode() === 'create') {
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
            this.sheet.addCut(config);
            this.temp_cut.remove();
            console.log('mouse released, deleting temp cut...');
        }
    
        this.jpaper.setInteractivity(true);
        this.temp_cut = null;
    }

    onMouseMove() {
        //console.log('mousemove', this);
        if(this.getMode() === 'create'){
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

    onMouseEnter() {
        this.paper_element.focus();
    }

    getRelativeMousePos() {
        return {
            x: E.mousePosition.x - this.paper_element.getBoundingClientRect().left,
            y: E.mousePosition.y - this.paper_element.getBoundingClientRect().top
        };
    }

    render() {
        const styles = {
            width: this.props.wrapperWidth || '100%',
            height: this.props.wrapperHeight || '100%'
        }
        return(
            <div class="paper-root">
                <div class="paper-wrapper" style={styles}>
                    <div 
                        id={this.props.id}
                        class="joint-paper"
                        onClick={this.onClick}
                        onKeyDown={this.onKeyDown}
                        onKeyUp={(event) => this.onKeyUp(event)}
                        onMouseDown={(event) => this.onMouseDown(event)}
                        onMouseUp={this.onMouseUp}
                        onMouseMove={this.onMouseMove}
                        onMouseEnter={this.onMouseEnter}
                        tabIndex="0"
                    ></div>
                </div>
            </div>
        );
    }
}

export function initializeContainerDrag(container_id){
    const ele = document.getElementById(container_id);
    ele.style.cursor = 'default';
  
      let pos = { top: 0, left: 0, x: 0, y: 0 };
  
      const mouseDownHandler = function(e) {
          if (!E.keys[16]) return;
          ele.style.cursor = 'grabbing';
          ele.style.userSelect = 'none';
  
          pos = {
              left: ele.scrollLeft,
              top: ele.scrollTop,
              // Get the current mouse position
              x: e.clientX,
              y: e.clientY,
          };
  
          ele.addEventListener('mousemove', mouseMoveHandler);
          ele.addEventListener('mouseup', mouseUpHandler);
      };
  
      const mouseMoveHandler = function(e) {
          // How far the mouse has been moved
          const dx = e.clientX - pos.x;
          const dy = e.clientY - pos.y;
  
          // Scroll the element
          ele.scrollTop = pos.top - dy;
          ele.scrollLeft = pos.left - dx;
      };
    
      const mouseUpHandler = function() {
          ele.style.cursor = 'default';
          ele.style.removeProperty('user-select');
  
          ele.removeEventListener('mousemove', mouseMoveHandler);
          ele.removeEventListener('mouseup', mouseUpHandler);
      };
  
      // Attach the handler
      ele.addEventListener('mousedown', mouseDownHandler);
  }