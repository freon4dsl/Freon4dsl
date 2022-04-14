import { PiType } from "@projectit/core";
import { PiTyper } from "./PiTyper";
// TODO see what the difference are between this class and OrderList in core/src/editor/simplifiedBoxAPI

export class TypeOrderedList<T extends PiType> implements Iterable<T> {
    protected elements: T[] = [];

    toArray(): T[] {
        return  this.elements;
    }

    add(p: T, typer: PiTyper) {
        if (!!typer) {
            if (!this.elements.find(e => typer.equals(e, p))) {
                this.elements.push(p);
            }
        }
    }

    addAll(list: TypeOrderedList<T>, typer: PiTyper) {
        for (const t of list) {
            this.add(t, typer);
        }
    }

    /**
     * Retains only the elements that are contained in the "list".
     * @param list
     */
    retainAll(list: TypeOrderedList<T>, typer: PiTyper) {
        const toRetain: T[] = [];
        this.elements.forEach((old, index) => {
            if (list.includes(old, typer)) {
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

    includes(p: T, typer: PiTyper): boolean {
        let result: boolean = false;
        if (!!typer) {
            for (const elem of this.elements) {
                if (typer.equals(elem, p)) {
                    result = true;
                }
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
    private list: TypeOrderedList<T>;

    constructor(list: TypeOrderedList<T>) {
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
