import * as joint from 'jointjs';
import GraphController from './GraphController.js';
import { getSafeCellAddOrder, getMousePosition, keyCodeIsActive, getMouseIsDown, getLocalGraphByID, contains } from '@util';
import Cut from './shapes/Cut.js';
import $ from 'jquery';
import _ from 'lodash';

/**
 * @class Existential Graph
 * This class is a wrapper around the joint paper, which is the svg canvas that is rendered / the user interacts with.
 * The joint paper reflects the graph defined by an associated joint Graph, which is contained in the Sheet class.
 */

const STATE = {
    NO_ACTION: -1,
    CREATE: 0,
    PROOF_BASE: 1,
    INSERT_SUBGRAPH: 2,
    ERASE_SUBGRAPH: 3,
    INSERT_DBL_CUT: 4,
    ERASE_DBL_CUT: 5,
}
const PAPER_SIZE = { width: 4000, height: 4000 };

export default class ExistentialGraph {
    constructor(dom_id, graph_id) {
        console.log('LOADING GRAPH', graph_id)
        this.graphController = new GraphController(this, graph_id);
        this.dom_element = document.getElementById(dom_id);
        this.paper = new joint.dia.Paper({
            el: this.dom_element,
            model: this.graphController.graph,
            width: PAPER_SIZE.width,
            height: PAPER_SIZE.height,
            preventContextMenu: false,
            clickThreshold: 1,
            interactive: function(cellView) {
                console.log('attr', cellView.model.attr('locked'))
                if (cellView.model.attr("locked")) {
                    return {
                        //locking disables moving the element
                        elementMove: false
                    }
                };
                return true;
            }
        });
        
        console.log("JOINT PAPER ", this.paper)

        //default state on creation is NO_ACTION until the graph is initialized
        this.state = STATE.NO_ACTION;

        //console.log(getLocalGraphByID(graph_id))
        const order = getSafeCellAddOrder(getLocalGraphByID(graph_id).graphJSON.cells);
        this.addCellsInOrder(order);
        
        // Paper events are callback functions defined on the joint paper that are 
        // triggered by user input (i.e. keystrokes, clicking, dragging, etc)
        this.setPaperEvents();

        this.canInsertPremise = true;
        // TODO: what does this mean? 
        this.previousPremiseCode = -1;

        //the selected premise is the Atomic/Cut that the user is currently interacting / last interacted with
        this.selected_premise = null;

        //The temporary cut is used for:
        // The cut seen when creating a cut through dragging.
        // When inserting a subgraph with more than one root elements, all elements are placed in a temporary
        // cut and inserted to ensure that the level order is preserved, then the temp cut is deleted.
        this.temp_cut = null;

        // Name of action selected by toolbar graph tool buttons
        this.graphTool = null;


        this.initial_cut_pos = {x: 0, y: 0};

        $(`#${dom_id}`).hover(function() {
            this.focus({
                preventScroll: true
              });
        }, function() {
            this.blur();
        });

        //default state after setup is CREATE mode
        this.state = STATE.CREATE;

        this.clipboard = null
    }

    setPaperEvents(){
        // paper events
        // arrow functions are required to keep proper context binding
        this.paper.on("element:mouseenter", ( cellView, evt ) => {
            let model = cellView.model
            let modelView = model.findView(this.paper);
            modelView.showTools()
            model.attr("rect/stroke", "red")
            model.attr("text/fill", "red")
            this.selected_premise = model
        });

        this.paper.on("element:mouseleave", ( cellView, evt ) =>{
            let model = cellView.model
            let modelView = model.findView(this.paper);
            if(!modelView) return;
            modelView.hideTools()
            model.attr("rect/stroke", "black")
            model.attr("text/fill", "black")
            this.selected_premise = undefined;
        })

        // First, unembed the cell that has just been grabbed by the user.
        this.paper.on('cell:pointerdown', (cellView, evt, x, y) => { 
            console.log("cell pointer down", this.paper)
            let cell = cellView.model;

            if (cell.attr('locked') === true) {
                console.log('this cell is locked!')
            }

            if (!cell.get('embeds') || cell.get('embeds').length === 0) {
                // Show the dragged element above all the other cells (except when the
                // element is a parent).
                cell.toFront();
            }
            
            if (cell.get('parent')) {
                this.graphController.graph.getCell(cell.get('parent')).unembed(cell);
            }
            cell.active();
            this.graphController.treeToFront(this.graphController.findRoot(cell));
        });

        // When the dragged cell is dropped over another cell, let it become a child of the
        // element below.
        this.paper.on('cell:pointerup', (cellView, evt, x, y) => {

            let cell = cellView.model;
            
            this.graphController.handleCollisions(cell)
            cell.inactive();

            this.selected_premise = null;
        });
        
    }

    setGraphName(name) {
        this.graphName = name;
    }

    getRelativeMousePos() {
        const mouse_pos = getMousePosition()
        return {
            x: mouse_pos.x - this.dom_element.getBoundingClientRect().left,
            y: mouse_pos.y - this.dom_element.getBoundingClientRect().top
        };
    }
    

    /**
     * 
     * @param {bool} clear - whether to prompt the user about clearing the graph. 
     *                      If true, the user is prompted to confirm whether they wish to empty the graph on import
     *                      if false, the graph is not cleared on import
     */
     importGraphFromFile(clear) {
        const input = document.createElement("input");
        input.type = "file";
        // choosing the file
        input.onchange = (ev) => {
            const file = ev.target.files[0];
            if (file.type !== "application/json") {
                alert("File must be of .JSON type");
                return;
            }
            // read the file
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (readerEvent) => {
                const content = readerEvent.target.result;
                if (clear) {
                    if (window.confirm("Erase your current workspace and import graph?")) {
                        this.graphController.graph.clear();

                        const dataObj = JSON.parse(content);
                        const order = getSafeCellAddOrder(dataObj.cells);
                        this.addCellsInOrder(order)
                    }
                } else {
                    const dataObj = JSON.parse(content);
                    const order = getSafeCellAddOrder(dataObj.cells);
                    this.addCellsInOrder(order);
                }
            };
        };
        input.click();
    }

    copySubgraph(target) {
        //save target root to clipboard
        this.clipboard = target;
    }

    pasteSubgraph(target, mouse_pos) {
        if (this.clipboard === null) return;
        this.graphController.addSubgraph(this.clipboard, mouse_pos, target);
    }

    addCellsInOrder(order) {
        console.log('adding in order', order)
        for (let [cellType, cell] of order) {
            if(cellType === 'cut') {
                this.graphController.addCut(cell);
            }
            else if (cellType === 'atomic') {
                this.graphController.addAtomic(cell);
            }
        }
    }

    exportGraphAsFile() {
        const graphJSON = this.exportGraphAsJSON()
        //console.log(graphJSON);
        const file = new Blob([JSON.stringify(graphJSON, null, 2)], { type: 'application/json'});
        const a = document.createElement("a");
        let url = URL.createObjectURL(file);
        a.href = url;
        a.download = `${this.graphName}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    exportGraphAsJSON() {
        // delete graph.changed;
        let graphJSON = this.graphController.graph.toJSON();
        for(let i = 0; i < graphJSON.cells.length; i++) {
            delete graphJSON.cells[i].graphController;
        }

        return graphJSON;
    }

    onKeyDown = (event) => {
        //backspace (delete premise or cut)
        if (event.keyCode === 8) {
            if (!this.selected_premise) return;
            //let delete_noise = new Audio(Delete);
            if (event.shiftKey) {
                //obliterate
                //this.props.handlePlayAudio(delete_noise);
                this.selected_premise.obliterate();
            } else  {
                //single deletion
                if (this.selected_premise.attributes.type === "dia.Element.Atomic") {
                    this.selected_premise.destroy()
                    //this.props.handlePlayAudio(delete_noise);
                } else if (this.selected_premise.attributes.type === "dia.Element.Cut") {
                    this.selected_premise.destroy();        // Play pop sound
                    //this.props.handlePlayAudio(delete_noise);
                } else {
                    console.error("attempted to delete shape of unknown type: " + this.selected_premise.attributes.type)
                }
            }
            this.selected_premise = null;
        }
        //a-z for creating premise
        const key = event.key.toLocaleUpperCase();
        const code = key.charCodeAt(0);
        if (this.canInsertPremise && key.length === 1 && !(event.ctrlKey || event.metaKey) && code >= 65 && code <= 90) {
            let config = {
                //use capital letters by default, can press shift to make lowercase
                attrs:{
                    text: {
                        text: key
                    }
                },
                position: this.getRelativeMousePos()
            }
            console.log('created config', config)
            //eslint-disable-next-line
            //let new_rect = new Premise().create(config)
            if (event.shiftKey) this.graphController.forcePremise(config);
            else { this.graphController.addAtomic(config); }
            this.canInsertPremise = false;
            this.previousPremiseCode = code;
        }
        //ENTER
        // new cut
        if (event.keyCode === 13) {
            let config = {
                position: this.getRelativeMousePos()
            }
            if (this.selected_premise) {
                config["child"] = this.selected_premise;
                this.graphController.addCut(config);
            } else {
                this.graphController.addCut(config);
            }
        }
    
        if (event.keyCode === 49) {
            //save template
            if (this.selected_premise) {
                this.saved_template = this.graphController.graph.cloneSubgraph([this.selected_premise], {deep: true});
            }
        }
    
        if (event.keyCode === 50) {
            const mouse_adjusted = this.getRelativeMousePos();
            //console.log("position", mouse_adjusted)
            if (this.saved_template) {
                this.graphController.addSubgraph(this.saved_template, mouse_adjusted, this.selected_premise);
            }
        }
    }

    onKeyUp = (event) => {
        if(event.keyCode === this.previousPremiseCode) this.canInsertPremise = true;
    }

    onMouseDown = (event) => {

        if (this.graphTool) return;

        //console.log('mousedown', this);
        if (keyCodeIsActive(16) /*&& this.getMode() === 'create'*/) {
            this.initial_cut_pos = this.getRelativeMousePos();
            let config  = {
                position: Object.assign({}, this.initial_cut_pos),
                size: {width: 0, height: 0}
            }
            //this.temp_cut = new Cut().create(config);
            //this.history.current.lock();
            this.temp_cut = this.graphController.addCut(config);
            this.temp_cut.active();
            event.preventDefault();
            console.log("CREATED TEMP CUT", this.temp_cut);
        }
    }

    onMouseUp = () => {

        if (this.graphTool) {
            console.log('executing ', this.graphTool);

            if (this.graphTool === 'cut') {
                let config = {
                    position: this.getRelativeMousePos()
                }
                if (this.selected_premise) {
                    config["child"] = this.selected_premise;
                    this.graphController.addCut(config);
                } else {
                    this.graphController.addCut(config);
                }
            }
            else if (this.graphTool === 'insert_double_cut') {
                this.graphController.insertDoubleCut(this.selected_premise, this.getRelativeMousePos())
            }
            else if (this.graphTool === 'erase_double_cut') {
                this.graphController.deleteDoubleCut(this.selected_premise);
            }
            else if (this.graphTool === 'insert_subgraph') {
                console.log('test')
                this.graphController.enableInsertMode(this.selected_premise);
            }
            else if (this.graphTool === 'erase_subgraph') {
                this.graphController.deleteSubgraph(this.selected_premise);
            }


            this.graphTool = null;
            return
        }

        if (this.temp_cut /*&& this.getMode() === 'create'*/) {
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
            //console.log('mouse released, deleting temp cut...');
            this.temp_cut.remove();
            //this.history.current.unlock();
            //NOTE: Temp cut must be deleted first or there will be uwnanted conflicts with  collisions
            this.graphController.addCut(config);
        }
    
        this.paper.setInteractivity(
            function(cellView) {
                console.log('attr', cellView.model.attr('locked'))
                if (cellView.model.attr("locked")) {
                    return {
                        //locking disables moving the element
                        elementMove: false
                    }
                };
                return true;
            });
        this.temp_cut = null;
    }

    onMouseMove = () => {
        if (getMouseIsDown() && keyCodeIsActive(16) && this.temp_cut) {
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