export function createResizeTool(config) {
    let r = (config && config.r) || 7
    let fill = (config && config.fill) || "red"
    let x = (config && config.x) || "0%"
    let y = (config && config.y) || "0%"
    let offset = (config && config.offset) || {x: 0, y:0}
    let cursor = (config && config.cursor) || "nw_resize"

    let ResizeTool = {
        markup: [{
            tagName: 'circle',
            selector: 'button',
            attributes: {
                'r': r,
                'fill': fill,
                'cursor': cursor
            }
        }],
        x: x,
        y: y,
        offset: offset,
        rotate: true,
        action: function(evt) {
            console.log("resize tool pressed")
        }
    };
    return ResizeTool
}