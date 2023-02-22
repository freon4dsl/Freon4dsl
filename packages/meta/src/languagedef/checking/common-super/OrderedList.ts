import { FreLangElement } from "../../metalanguage";

interface InternalElement<T> {
    name: string;
    element: T;
}

export class OrderedList<T extends FreLangElement> implements Iterable<T> {
    protected elements: InternalElement<T>[] = [];

    toArray(): T[] {
        return this.elements.map(elem => elem.element);
    }

    add(name: string, p: T) {
        if (!this.elements.find(e => e.name === name)) {
            this.elements.push({ name: name, element: p });
        }
    }

    addAll(list: OrderedList<T>) {
        for (const t of list) {
            this.add(t.name, t);
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
           if (!list.getByName(old.name)) {
               toBeRemoved.push(index);
           }
        });
        // console.log("Before removing: " + this.elements.map(elem => elem.name).join(", "));
        // In order to avoid errors because of the splice() method doing a re-indexing,
        // we loop over the list of indexes backwards
        for (let i = toBeRemoved.length - 1; i >= 0 ; i--) {
            this.elements.splice(toBeRemoved[i], 1);
            // console.log("After removing nr[" + toBeRemoved[i-1] + "] : " + this.elements.map(elem => elem.name).join(", "));
        }
    }

    length(): number {
        return this.elements.length;
    }

    get(index: number): InternalElement<T> {
        return this.elements[index];
    }

    getByName(name: string): InternalElement<T> {
        return this.elements.find(p => p.name === name);
    }

    [Symbol.iterator](): Iterator<T> {
        return new OrderedListIterator<T>(this);
    }

}

export class OrderedListIterator<T extends FreLangElement> implements Iterator<T> {
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
