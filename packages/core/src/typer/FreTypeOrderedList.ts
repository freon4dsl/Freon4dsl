import { FreTyper } from "./FreTyper";
import { FreType } from "./FreType";

export class FreTypeOrderedList<T extends FreType> implements Iterable<T> {
    protected elements: T[] = [];

    toArray(): T[] {
        return this.elements;
    }

    add(p: T, typer: FreTyper) {
        // TODO Check: Why use typeof
        if (typeof typer !== "undefined") {
            if (!this.elements.find((e) => typer.equals(e, p))) {
                this.elements.push(p);
            }
        }
    }

    addAll(list: FreTypeOrderedList<T>, typer: FreTyper) {
        for (const t of list) {
            this.add(t, typer);
        }
    }

    /**
     * Retains only the elements that are contained in the "list".
     * @param list
     * @param typer
     */
    retainAll(list: FreTypeOrderedList<T>, typer: FreTyper) {
        const toRetain: T[] = [];
        this.elements.forEach((old) => {
            if (list.includes(old, typer)) {
                toRetain.push(old);
            }
        });
        this.elements = toRetain;
    }

    length(): number {
        return this.elements.length;
    }

    get(index: number): T {
        return this.elements[index];
    }

    includes(p: T, typer: FreTyper): boolean {
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
        return new FrOrderedListIterator<T>(this);
    }
}

export class FrOrderedListIterator<T extends FreType> implements Iterator<T> {
    private index = 0;
    private list: FreTypeOrderedList<T>;

    constructor(list: FreTypeOrderedList<T>) {
        this.list = list;
    }

    // @ts-expect-error
    // todo remove parameter
    next(value?: any): IteratorResult<T> {
        const l = this.list.length();
        if (this.index < l) {
            return { done: false, value: this.list.get(this.index++) };
        } else {
            return { done: true, value: undefined };
        }
    }
}
