import { PiType } from "../extras/PiType";
import { ProjectXTyper } from "../gen";

export class OrderedList<T extends PiType> implements Iterable<T> {
    protected elements: T[] = [];
    typer: ProjectXTyper;

    toArray(): T[] {
        return  this.elements;
    }

    add(p: T) {
        if (!this.typer) {
            this.typer = new ProjectXTyper();
        }
        if (!this.elements.find(e => (this.typer as ProjectXTyper).equals(e, p))) {
            this.elements.push(p);
        }
    }

    addAll(list: OrderedList<T>) {
        for (const t of list) {
            this.add(t);
        }
    }

    /**
     * Retains only the elements that are contained in the "list".
     * @param list
     */
    retainAll(list: OrderedList<T>) {
        const toRetain: T[] = [];
        this.elements.forEach((old, index) => {
            if (list.includes(old)) {
                toRetain.push(old);
            }
        });
        // console.log("Comparing [" +
        // this.elements.map(el => el.toPiString()).join(", ") + "] with [" +
        // list.elements.map(el => el.toPiString()).join(", ") + "]"
        // + "\n\tRESULT: " + toRetain.map(el => el.toPiString()).join(", "));
        this.elements = toRetain;
    }

    length(): number {
        return this.elements.length;
    }

    get(index: number): T {
        return this.elements[index];
    }

    includes(p: T): boolean {
        if (!this.typer) {
            this.typer = new ProjectXTyper();
        }
        let result: boolean = false;
        for (const elem of this.elements) {
            if (this.typer.equals(elem, p)) {
                result = true;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<T> {
        return new OrderedListIterator<T>(this);
    }

}

export class OrderedListIterator<T extends PiType> implements Iterator<T> {
    private index = 0;
    private list: OrderedList<T>;

    constructor(list: OrderedList<T>) {
        this.list = list;
    }

    next(value?: any): IteratorResult<T> {
        const l = this.list.length();
        if (this.index < l) {
            return { done: false, value: this.list.get(this.index++) };
        } else {
            return { done: true, value: undefined };
        }
    }

}
