import $ from "jquery";

class EventController {
    constructor() {
        this.mousePosition =  {x: 0, y: 0};
        this.keys = [];
        this.which = 0;
        this.key = '';
        this.isMouseDown = false;
    }

    isActive(key) {
        return this.key.toLocaleLowerCase() === key || this.which === key || this.keys[key] === true;
    }

}

let E = new EventController();

$(document).on('keydown', function(event) {
    E.keys[event.which] = true;
    E.which = event.which;
    E.key = event.key;
});

$(document).on('keyup', function(event){
    E.keys[event.which] = false;
    E.which = event.which;
    E.key = event.key;
});

$(document).on('mousemove', function(event) {
    E.mousePosition = {
        x: event.clientX,
        y: event.clientY
    }
});

$(document).on('mousedown', function(event) {
    this.isMouseDown = true;
});

$(document).on('mouseup', function(event) {
    this.isMouseDown = false;
});

export default E;