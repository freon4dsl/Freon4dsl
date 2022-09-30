import { IFrTyper } from "./IFrTyper";
import { PiType } from "./PiType";
import { PiTyper } from "./PiTyper";

export class FrTypeOrderedList<T extends PiType> implements Iterable<T> {
    protected elements: T[] = [];

    toArray(): T[] {
        return  this.elements;
    }

    add(p: T, typer: IFrTyper) {
        if (!!typer) {
            if (!this.elements.find(e => typer.equals(e, p))) {
                this.elements.push(p);
            }
        }
    }

    addAll(list: FrTypeOrderedList<T>, typer: IFrTyper) {
        for (const t of list) {
            this.add(t, typer);
        }
    }

    /**
     * Retains only the elements that are contained in the "list".
     * @param list
     */
    retainAll(list: FrTypeOrderedList<T>, typer: IFrTyper) {
        const toRetain: T[] = [];
        this.elements.forEach((old, index) => {
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

    includes(p: T, typer: IFrTyper): boolean {
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

export class FrOrderedListIterator<T extends PiType> implements Iterator<T> {
    private index = 0;
    private list: FrTypeOrderedList<T>;

    constructor(list: FrTypeOrderedList<T>) {
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
