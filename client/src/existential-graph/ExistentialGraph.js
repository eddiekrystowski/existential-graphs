import * as joint from 'jointjs';
import Sheet from './Sheet.js';
import { getSafeCellAddOrder, getMousePosition, keyCodeIsActive, getMouseIsDown, getLocalGraphByID, contains } from '@util';
import Cut from './Cut.js';
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
        this.sheet = new Sheet(this, graph_id);
        this.dom_element = document.getElementById(dom_id);
        this.paper = new joint.dia.Paper({
            el: this.dom_element,
            model: this.sheet.graph,
            width: PAPER_SIZE.width,
            height: PAPER_SIZE.height,
            preventContextMenu: false,
            clickThreshold: 1
        });

        //default state on creation is NO_ACTION until the graph is initialized
        this.state = STATE.NO_ACTION;

        //console.log(getLocalGraphByID(graph_id))
        const order = getSafeCellAddOrder(getLocalGraphByID(graph_id).graphJSON.cells);
        this.addCellsInOrder(order);
        
        // Paper events are callback functions defined on the joint paper that are 
        // triggered by user input (i.e. keystrokes, clicking, dragging, etc)
        this.setPaperEvents();

        //this.canInsertPremise = true;
        // TODO: what does this mean? 
        this.previousPremiseCode = -1;

        //the selected premise is the Atomic/Cut that the user is currently interacting / last interacted with
        this.selected_premise = null;

        //The temporary cut is used for:
        // The cut seen when creating a cut through dragging.
        // When inserting a subgraph with more than one root elements, all elements are placed in a temporary
        // cut and inserted to ensure that the level order is preserved, then the temp cut is deleted.
        this.temp_cut = null;


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
        
    }

    setPaperEvents(){
        // paper events
        // arrow functions are required to keep proper context binding
        this.paper.on("element:mouseenter", ( cellView, evt ) => {
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            modelView.showTools()
            model.attr("rect/stroke", "red")
            model.attr("text/fill", "red")
            this.selected_premise = model
        });

        this.paper.on("element:mouseleave", ( cellView, evt ) =>{
            let model = cellView.model
            let modelView = model.findView(this.jpaper);
            if(!modelView) return;
            modelView.hideTools()
            model.attr("rect/stroke", "black")
            model.attr("text/fill", "black")
            this.selected_premise = undefined;
        })

        // First, unembed the cell that has just been grabbed by the user.
        this.paper.on('cell:pointerdown', (cellView, evt, x, y) => { 
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
        this.paper.on('cell:pointerup', (cellView, evt, x, y) => {

            let cell = cellView.model;
            
            this.sheet.handleCollisions(cell)
            cell.inactive();

            // if(!this.props.action) this.onGraphUpdate();
            // let nextAction;
            // if (this.props.action) {
            //     nextAction = this.props.action(this.sheet, cell, this.getRelativeMousePos());
            // }
            // if (this.props.handleClearAction && !nextAction) this.props.handleClearAction();
            // if(nextAction) this.props.handleActionChange(nextAction);
            this.selected_premise = null;
        });

        // this.sheet.graph.on('add', () => {
        //     this.onGraphUpdate();
        // });

        //PAPER UNDO AND REDO EVENTS
        if (false) {
            // $(this.dom_element).on('keydown', (event) => {
            //     if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
            //         const new_state = this.history.current.undo();
            //         this.selected_premise = null;
            //         //only update graph if new state exists
            //         //undo will return false if can't undo anymore
            //         if (new_state) {
            //             this.history.current.lock();
            //             this.sheet.importCells(new_state);
            //             this.history.current.unlock();
            //         }
            //     }
            //     if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && event.shiftKey) {
            //         const new_state = this.history.current.redo();
            //         //only update graph if new state exists
            //         //redo will return false if can't redo anymore
            //         if (new_state) {
            //             this.history.current.lock();
            //             this.sheet.importCells(new_state);
            //             this.history.current.unlock();
            //         }
            //     }
            // });
        }
        
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
                        this.sheet.graph.clear();

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

    addCellsInOrder(order) {
        console.log('adding in order', order)
        for (let [cellType, cell] of order) {
            if(cellType === 'cut') {
                this.sheet.addCut(cell);
            }
            else if (cellType === 'atomic') {
                this.sheet.addAtomic(cell);
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
        let graphJSON = this.sheet.graph.toJSON();
        for(let i = 0; i < graphJSON.cells.length; i++) {
            delete graphJSON.cells[i].sheet;
        }

        return graphJSON;
    }

    /**
     * Force an array of cells into a Cut (target) even if they do not fit by resizing and moving 
     * the target and its children / neighbors
     * @param {Cell[]} cells 
     * @param {Cut} target
     */
     forceParseCells(cells, cellsbbox, target) {
        console.clear()
        console.log("forcing cells: ",cells)
        console.log("to target: ", target)
        if (cells === null) return;
        if (target === null || target.attributes.type !== "dia.Element.Cut") return;

        // We have a non empty array of cells to insert into a cut
        //create a temporary root cut to insert all cells into
        const config = {
            size: {
                width: cellsbbox.width + 10,
                height: cellsbbox.height + 10
            },
            position: {
                x: cellsbbox.x-10,
                y: cellsbbox.y-10
            },
            attrs: {
                rect: {
                    width: cellsbbox.width + 10,
                    height: cellsbbox.height + 10
                }
            }
        }
        const cut = (new Cut({
            markup: '<rect/><text/>',
            position: {
                ...config.position
            },
            size: {
                ...config.size
            },
            attrs: {
                rect: {
                    ...config.attrs.rect
                },
                text: {
                    ...config.attrs.text
                },
                level: 0
            },
            // set custom attributes here:
            sheet: this.sheet
        })).create(config, this.sheet)
        // put the cut inside the target 
        target.embed(cut);
        const target_bbox = target.getBoundingBox();
        const cut_bbox = cut.getBoundingBox();
        const buffer = 10;
        if (!contains(target_bbox, cut_bbox)) {
            //check if premise is to the left of parent
            if (cut_bbox.x <= target_bbox.x) {
                const diff = target_bbox.x - cut_bbox.x - buffer;
                target.position(cut_bbox.x - buffer, target_bbox.y);
                target.attr("rect/width", target.attributes.attrs.rect.width + diff);
            } 
            //check if premise is to the right of parent
            if (cut_bbox.x + cut_bbox.width >= target_bbox.x + target_bbox.width) {
                const diff = cut_bbox.x + cut_bbox.width - (target_bbox.x + target_bbox.width);
                target.attr("rect/width", target.attributes.attrs.rect.width + diff + buffer);
            }
            // check if premise is above parent
            if (cut_bbox.y <= target_bbox.y) {
                const diff = target_bbox.y - cut_bbox.y - buffer;
                target.position(target_bbox.x, cut_bbox.y - buffer);
                target.attr("rect/height", target.attributes.attrs.rect.height + diff);
            }
            //check if premise is below parent
            if (cut_bbox.y + cut_bbox.height >= target_bbox.y + target_bbox.height){
                const diff = cut_bbox.y + cut_bbox.height - (target_bbox.y + target_bbox.height) + 10;
                target.attr("rect/height", target.attributes.attrs.rect.height + diff + buffer);
            }
        }
        console.log("GHOST CUT: ", cut)
        this.sheet.handleCollisions(cut)

        //update position of cells based on where cut ends up
        console.log("updating cells",cells);

        for (const cell of cells) {
            console.log("updating cell position:",cell.position)
            cell.position = {
                x: cut.attributes.position.x + (cell.position.x-cellsbbox.x + 5), 
                y: cut.attributes.position.y + (cell.position.y-cellsbbox.y + 5)
            }
        }
        
        const ids = {}; 
        while (cells.length > 0) {
            const cell = cells.shift();
            const type = cell.type;

            if (cell.parent && !ids.hasOwnProperty(cell.parent)) {
                //console.log('has parent, skipping for now...')
                cells.push(cell);
                continue;
            }

            if (type === "dia.Element.Cut") {
                const new_cut =  this.sheet.addCut(cell);
                ids[cell.id] = true;
            }
            else if (type === "dia.Element.Atomic") {
                const new_atomic = this.sheet.addAtomic(cell);
                ids[cell.id] = true;
            }
        }

        cut.destroy()

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
            if (event.shiftKey) this.sheet.forcePremise(config);
            else { this.sheet.addAtomic(config); }
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
                this.sheet.addCut(config);
            } else {
                this.sheet.addCut(config);
            }
        }
    
        if (event.keyCode === 49) {
            //save template
            if (this.selected_premise) {
                this.saved_template = this.sheet.graph.cloneSubgraph([this.selected_premise], {deep: true});
            }
        }
    
        if (event.keyCode === 50) {
            const mouse_adjusted = this.getRelativeMousePos();
            //console.log("position", mouse_adjusted)
            if (this.saved_template) {
                this.sheet.addSubgraph(this.saved_template, mouse_adjusted, this.selected_premise);
            }
        }
    }

    onKeyUp = (event) => {
        if(event.keyCode === this.previousPremiseCode) this.canInsertPremise = true;
    }

    onMouseDown = (event) => {
        //console.log('mousedown', this);
        if (keyCodeIsActive(16) /*&& this.getMode() === 'create'*/) {
            this.initial_cut_pos = this.getRelativeMousePos();
            let config  = {
                position: Object.assign({}, this.initial_cut_pos),
                size: {width: 0, height: 0}
            }
            //this.temp_cut = new Cut().create(config);
            //this.history.current.lock();
            this.temp_cut = this.sheet.addCut(config);
            this.temp_cut.active();
            event.preventDefault();
            console.log("CREATED TEMP CUT", this.temp_cut);
        }
    }

    onMouseUp = () => {
        //console.log('mouseup', this);
        if (false/*this.getMode() === 'proof'*/) {
            //this.history.current.startBatch();
            if (!this.selected_premise && this.props.action && this.props.action.name === 'insertDoubleCut') {
                const mouse_adjusted = this.getRelativeMousePos();
                this.props.action(this.sheet, null, mouse_adjusted);
                this.props.handleClearAction();
            }
            if (!this.selected_premise && this.props.action && this.props.action.name === 'bound iterationend') {
                const mouse_adjusted = this.getRelativeMousePos();
                this.props.action(this.sheet, null, mouse_adjusted);
                this.props.handleClearAction();
            }
            //this.history.current.endBatch();
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
            this.sheet.addCut(config);
        }
    
        this.jpaper.setInteractivity(true);
        this.temp_cut = null;
    }

    onMouseMove = () => {
        //console.log('mousemove', this);
        if(true/*this.getMode() === 'create'*/){
            //console.log(E.isMouseDown);
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
}