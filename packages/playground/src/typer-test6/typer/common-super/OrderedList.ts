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
        // console.log("SSSSSSSSSSSSSSSSSSS")
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
