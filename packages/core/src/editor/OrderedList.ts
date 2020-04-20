export interface NamedElement<T> {
    name: string;
    element: T;
}

export class OrderedList<T> {
    private elements: NamedElement<T>[] = [];

    constructor() {}

    toArray(): NamedElement<T>[] {
        return this.elements;
    }

    add(name: string, p: T) {
        this.elements.push({ name: name, element: p });
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
}
