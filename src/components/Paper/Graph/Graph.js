import * as joint from 'jointjs';

import { Cut } from '../../../shapes/Cut/Cut';
import { Premise } from '../../../shapes/Premise/Premise';
import { color } from '../../../util/color';

const NSPremise = joint.dia.Element.define('nameSpace.Premise',Premise);
const NSCut = joint.dia.Element.define('nameSpace.Cut',Cut);

const DEFAULT_BACKGROUND_COLORS = {
    even: color.shapes.background.even.inactive,
    odd: color.shapes.background.odd.inactive,
    premise: color.shapes.background.default.color
}

export default class Graph {
    constructor(paper) {
        this.paper = paper;
        this.jgraph = new joint.dia.Graph({}, {
            cellNamespace: {
                nameSpace: { 
                    Premise: NSPremise,
                    Cut: NSCut
                }
            }
        });
    }

    addPremise(config) {
        const premise = (new Premise()).create(config, this);
        this.handleCollisions(premise);
        return premise;
    }

    addCut(config) {
        const cut = (new Cut()).create(config, this);
        this.handleCollisions(cut);
        return cut;
    }

    //TODO: some of these functions kind of fit here and also kind of don't. I'm moving them here for now
    // because in the future it would be beneficial to at least have a "entire graph update" be possible, which would be very simple to 
    // do if they are all bundled up.
    handleCollisions(cell) {
        //This function takes a Cell as input and, using its position
        // makes any necessary changes to the internal representation of
        // the diagram (parent / child structure (embedding)) to reflect what the user
        // sees on the paper
        let cellbbox = {
            width: cell.attributes.attrs.rect.width,
            height: cell.attributes.attrs.rect.height,
            x: cell.attributes.position.x,
            y: cell.attributes.position.y
        }
    
        let potential_parents = this.findPotentialParents(cellbbox);
        let parent = this.findSmallestCell(potential_parents);
    
        if (parent) {
            let children = this.filterChildren(parent, cellbbox)
            //embed cell into parent
            parent.embed(cell);
            console.log("childrenPPPPPPPPPP==========", children);
    
            //reroot children
            for (const child of children) {
                if (child.get("parent")) {
                    parent.unembed(child);
                }
                cell.embed(child)
            }
            this.treeToFront(parent)
        } else {
            let elements_inside = this.findElementsInside(cellbbox)
            for (const element of elements_inside) {
                if (element.get("parent") || element.id === cell.id) {
                    continue;
                }
                cell.embed(element)
            }
            this.treeToFront(cell)
        }
        //recolor trees to reflect new level structure
        this.colorByLevel(cell);
    
        //check 
    }


    findElementsInside(bbox, cells=this.jgraph.getCells()) {
        //takes two bbox objects as input
        //bbox objects should have the structure:
        // {
        //      width: int,
        //      height: int,
        //      x: int,
        //      y: int
        // }
        let elements = []
        for (const cell of cells) {
            let otherbbox = {
                width: cell.attributes.attrs.rect.width,
                height: cell.attributes.attrs.rect.height,
                x: cell.attributes.position.x,
                y: cell.attributes.position.y
            }
            if (this.contains(bbox, otherbbox)) {
                elements.push(cell)
            }
        }
        return elements
    }


    findPotentialParents(targetbbox) {
        // POTENTIAL PARENTS -- potential parents are only the cells that 
        //                      contain (completely) the CELL.
        let cells = this.jgraph.getCells()
        let potential_parents = []
        for (const cell of cells) {
            let otherbbox = {
                width: cell.attributes.attrs.rect.width,
                height: cell.attributes.attrs.rect.height,
                x: cell.attributes.position.x,
                y: cell.attributes.position.y
            }
            //find cells who contain target cell
            if (this.contains(otherbbox, targetbbox)) {
                //console.log("potential parent found")
                potential_parents.push(cell)
            }
        }
    
        return potential_parents
    }


    findSmallestCell(cells) {
        // returns the smallest cell (by area) of an array of joint.dia.Cell objects
        if (cells.length === 0) { return undefined }
        let smallest_area = cells[0].attributes.attrs.rect.width * cells[0].attributes.attrs.rect.height;
        let smallest_cell = cells[0];
        for (const cell of cells) {
            let width = cell.attributes.attrs.rect.width;
            let height = cell.attributes.attrs.rect.height;
            let area = width * height;
            if (area < smallest_area) {
                smallest_area = area;
                smallest_cell = cell;
            }
        }
        return smallest_cell
    }


    filterChildren(parent, new_child_bbox) {
        //function returns array of children who fit inside new child
        let cells = this.jgraph.getCells();
        let potential_children = [];
        for (const cell of cells) {
            if (!(cell.get("parent")) || cell.get("parent") === parent.id){
                potential_children.push(cell)
            }
        }
        let children = this.findElementsInside(new_child_bbox, potential_children)
        return children;
    }

    contains(bbox, otherbbox) {
        // returns true of otherbbox fits completely inside of bbox
        let bbox_info = {
            left_x: bbox.x,
            right_x: bbox.x + bbox.width,
            top_y: bbox.y,
            bottom_y: bbox.y + bbox.height
        }
        let otherbbox_info = {
            left_x: otherbbox.x,
            right_x: otherbbox.x + otherbbox.width,
            top_y: otherbbox.y,
            bottom_y: otherbbox.y + otherbbox.height
        }
        if (bbox_info.left_x < otherbbox_info.left_x && bbox_info.right_x > otherbbox_info.right_x && bbox_info.top_y < otherbbox_info.top_y && bbox_info.bottom_y > otherbbox_info.bottom_y) {
            //console.log("bbox contains otherbbox", bbox, otherbbox);
            return true;
        } else {
            return false;
        }
    }

    treeToFront(root) {
        //loops through a tree from its root to the leaves
        //to ensure correct z order
        let current = [root]
        let next = []
        while (current.length > 0) {
            for (const node of current) {
                console.log(node);
                node.toFront();
                let children = node.getEmbeddedCells();
                next.push(...children);
            }
            current = next
            next = []
        }
    }


    //i think these are graph related functions??? since they call handle collisions, tree stuff, etc which
    //could be specific to a graph
    addSubgraph(subgraph, position) {
        let root = subgraph[Object.keys(subgraph)[0]];
        let root_clone = root.clone();
        let new_root = this.subgraphToGraph(root, root_clone, subgraph)
        this.treeMove(new_root, position);
        this.handleCollisions(new_root);
    }

    subgraphToGraph(node, clone, subgraph, parent=null) {
        clone.addTo(this.jgraph);
        if (parent != null) {
            parent.embed(clone);
        }
        let embeds = node.get('embeds');
        if (embeds){
            for (const embed of embeds) {
                let child = this.findCellInSubgraph(embed, subgraph);
                this.subgraphToGraph(child, child.clone(), subgraph, clone);
            }
        }
        return clone;
    }

    findCellInSubgraph(id, subgraph) {
        let keys = Object.keys(subgraph);
        for (const key of keys) {
            let cell = subgraph[key];
            if (cell.id === id) {
                return cell;
            }
        }
        alert("find subgraph failed!");
        return null;
    }

    //FIXME: these functions don't seem to be related to a specific graph, yet i'm not sure where to put them.
    // I don't think just having them sit out in the open is a great idea either.
    // Possibly we can just have these functions sit at the bottom of this file (outside of the class)
    // We can't really make a class with these functions since the jgraph itself is the tree and we are just defining operations on it
    //      - or maybe we can if we get creative, have to think more about it
    treeResize(root, resize_value = 20, center_nodes = true) {
        //resizes all the children of a root, not including the root
        let current = root.getParentCell();
        while (current) {
            console.log("current", current)
            current.attr("rect/width", current.attributes.attrs.rect.width + resize_value);
            current.attr("rect/height", current.attributes.attrs.rect.height + resize_value);
            if (center_nodes) {
                current.set("position", {x: current.attributes.position.x - resize_value/2,
                                         y: current.attributes.position.y - resize_value/2});
            }
            current = current.getParentCell();
        }
    }
    
    findRoot(node) {
        while (true) {
            if (node.get("parent")) {
                node = node.getParentCell();
            } else {
                break;
            }
        }
        return node;
    }
    
    findLevel(node) {
        let level = 0;
        let parent = node.getParentCell();
        while (parent) {
            level++;
            parent = parent.getParentCell();
        }
        return level;
    }
    
    colorByLevel(node, color_config = DEFAULT_BACKGROUND_COLORS) {
        //find root of node's tree
        let root = this.findRoot(node);
    
        if (root.attributes.type === "dia.Element.Premise") {
            root.attr('rect/fill', color_config.premise);
            return;
        }
        //otherwise its a cut root
    
        root.attr("level", 0);
        root.attr("rect/fill", color_config.odd)
        let level = 0;
        let children = root.getEmbeddedCells();
        while(children.length > 0) {
            level++
            //the color applies to the level contained within the cut, not the level the cut is on
            let parity = (level+1) % 2;
            let next_children = []
            for (const child of children) {
                child.attr("level", level);
                if (child.attributes.type === "dia.Element.Premise") {
                    child.attr("rect/fill", color_config.premise)
                    continue;
                }
                //coloring cut
                child.attributes.attrs.level = level;
                if (parity === 0) {
                    child.attr("rect/fill", color_config.even) 
                } else {
                    child.attr("rect/fill", color_config.odd);   
                }                                 
                next_children.push(...child.getEmbeddedCells());
            }
            children = next_children;
        }
    
    }
    
    treeMove(root, position) {
        let offset = {
            x: position.x - root.attributes.position.x,
            y: position.y - root.attributes.position.y
        }
        console.log(offset);
        let current = [];
        let next = [root];
        while (next.length > 0) {
            current = next;
            next = [];
            console.log(current);
            for (const node of current) {
                next.push(...node.getEmbeddedCells());
                node.position(node.attributes.position.x + offset.x, node.attributes.position.y + offset.y);
            }
        }
    
    }
}