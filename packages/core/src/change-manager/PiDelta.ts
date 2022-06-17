import { PiElement, PiElementReference, PiNamedElement } from "../ast";

export abstract class PiDelta {
    owner: PiElement;
    propertyName: string;
    index: number; // only used in case the changed element is (part of) a list

    constructor(owner: PiElement, propertyName: string, index?: number) {
        this.owner = owner;
        this.propertyName = propertyName;
        if (index !== null && index !== undefined) {
            this.index = index;
        }
    }

    toString(): string {
        return "Delta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiPrimDelta extends PiDelta {
    oldValue: string | boolean | number;
    newValue: string | boolean | number;

    constructor(owner: PiElement, propertyName: string, oldValue: string | boolean | number, newValue: string | boolean | number, index?: number) {
        super(owner, propertyName, index);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    toString(): string {
        return "PiPrimDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiPartDelta extends PiDelta {
    oldValue: PiElement;
    newValue: PiElement;

    constructor(owner: PiElement, propertyName: string, oldValue: PiElement, newValue: PiElement, index?: number) {
        super(owner, propertyName, index);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

export class PiRefDelta extends PiDelta {
    oldValue: PiElementReference<PiNamedElement>;
    newValue: PiElementReference<PiNamedElement>;

    constructor(owner: PiElement, propertyName: string, oldValue: PiElementReference<PiNamedElement>, newValue: PiElementReference<PiNamedElement>, index?: number) {
        super(owner, propertyName, index);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}

export class PiListDelta extends PiDelta {
    removedCount: number;
    added: PiElement[];

    constructor(owner: PiElement, propertyName: string, index: number, removedCount: number, added: PiElement[]) {
        super(owner, propertyName, index);
        this.removedCount = removedCount;
        this.added = added;
    }
}

export class TransactionDelta extends  PiDelta {
    internalDeltas: PiDelta[] = [];

    toString(): string {
        return "TransactionDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}
