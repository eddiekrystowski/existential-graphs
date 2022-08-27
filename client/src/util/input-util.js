import $ from 'jquery'

const MOUSE_POSITION = {x: 0, y: 0}
const KEYS = [];
let key = '';
let which = '';
let isMouseDown = false;

$(document).on('mousemove', function(event) {
    MOUSE_POSITION.x = event.clientX;
    MOUSE_POSITION.y = event.clientY;
});

$(document).on('keydown', function(event) {
    KEYS[event.keyCode] = true;
    key = event.key;
    which = event.which;
});

$(document).on('keyup', function(event) {
    KEYS[event.keyCode] = false;
    key = event.key;
    which = event.which;
});

$(document).on('mousedown', function(event) {
    isMouseDown = true;
});

$(document).on('mouseup', function(event) {
    isMouseDown = false;
});

export function getMousePosition() {
    return MOUSE_POSITION;
}

export function getKeys() {
    return KEYS;
}

export function keyCodeIsActive(keyCode) {
    return KEYS[keyCode];
}

export function keyActive(key) {
    return KEYS[key.charCodeAt(0)];
}

export function getMouseIsDown() {
    return isMouseDown;
}