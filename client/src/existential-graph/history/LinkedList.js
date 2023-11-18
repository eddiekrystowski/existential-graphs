import Item from "./HistoryItem";

export class LinkedList {
    constructor() {
        this.head = new Item("head")
        this.tail = new Item("tail");
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    pop() {
        let element = this.tail.prev;
        this.tail.prev = element.prev;
        return this.element.value;
    }

    push(val) {
        let new_item = new Item(val);

        new_item.prev = this.tail.prev;
        new_item.next = this.tail;

        this.tail.prev.next = new_item;
        this.tail.prev = new_item;
    }

    peek() {
        return this.tail.prev.value()
    }
}