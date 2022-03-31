import { PiElement, PiTyper } from "@projectit/core";
import { ProjectXEnvironment } from "../../environment/gen/ProjectXEnvironment";

export class OrderedList<T extends PiElement> implements Iterable<T> {
    protected elements: T[] = [];
    typer: PiTyper;

    toArray(): T[] {
        return  this.elements;
    }

    add(p: T) {
        if (!this.typer) {
            this.typer = ProjectXEnvironment.getInstance().typer;
        }
        if (!this.elements.find(e => this.typer.equalsType(e, p))) {
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
     * @param retained
     * @param additional
     * @private
     */
    retainAll(list: OrderedList<T>) {
        const toBeRemoved: number [] = []; // the indexes of elements that need to be removed
        this.elements.forEach((old, index) => {
           if (!list.includes(old)) {
               toBeRemoved.push(index);
           }
        });
        // console.log("Before removing: " + this.elements.map(elem => elem.name).join(", "));
        // In order to avoid errors because of the splice() method doing a re-indexing,
        // we loop over the list of indexes backwards
        for (let i = toBeRemoved.length-1; i >= 0 ; i--) {
            this.elements.splice(toBeRemoved[i], 1);
            // console.log("After removing nr[" + toBeRemoved[i-1] + "] : " + this.elements.map(elem => elem.name).join(", "));
        }
    }

    length(): number {
        return this.elements.length;
    }

    get(index: number): T {
        return this.elements[index];
    }

    includes(p: T): boolean {
        if (!this.typer) {
            this.typer = ProjectXEnvironment.getInstance().typer;
        }
        let result: boolean = false;
        for (const elem of this.elements) {
            if (this.typer.equalsType(elem, p)) {
                result = true;
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<T> {
        return new OrderedListIterator<T>(this);
    }

}

export class OrderedListIterator<T extends PiElement> implements Iterator<T> {
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
