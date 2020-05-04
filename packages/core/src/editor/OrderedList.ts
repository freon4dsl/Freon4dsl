import { observable } from "mobx";

export interface NamedElement<T> {
    name: string;
    element: T;
}

export class OrderedList<T> implements Iterable<T> {
    @observable protected elements: NamedElement<T>[] = [];

    constructor() {
    }

    toArray(): NamedElement<T>[] {
        return this.elements;
    }

    add(name: string, p: T) {
        this.elements.push({ name: name, element: p });
    }

    length(): number {
        return this.elements.length;
    }

    toFront(name: string) {
        let index = this.elements.findIndex(np => np.name === name);
        if (index < 0) {
            return;
        }
        const tobeMoved = this.elements[index];
        for (let i: number = index; i > 0; i--) {
            this.elements[i] = this.elements[i - 1];
        }
        this.elements[0] = tobeMoved;
    }

    toBack(name: string) {
        let index = this.elements.findIndex(np => np.name === name);
        if (index < 0) {
            return;
        }
        const size = this.elements.length;
        const tobeMoved = this.elements[index];
        for (let i: number = index; i < size - 1; i++) {
            this.elements[i] = this.elements[i + 1];
        }
        this.elements[0] = tobeMoved;
    }

    get(index: number): NamedElement<T> {
        return this.elements[index];
    }

    [Symbol.iterator](): Iterator<T> {
        return new OrderedListIterator<T>(this);
    }

}

export class OrderedListIterator<T> implements Iterator<T> {
    private index = 0;
    private list: OrderedList<T>;

    constructor(list: OrderedList<T>) {
        this.list = list;
    }

    next(value?: any): IteratorResult<T> {
        const l = this.list.length();
        if (this.index < l) {
            return { done: false, value: this.list.get(this.index++).element };
        } else {
            return { done: true, value: undefined };
        }
    }

}
