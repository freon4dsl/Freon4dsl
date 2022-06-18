import { DecoratedModelElement, PiElement, PiElementBaseImpl, PiElementReference, PiNamedElement } from "../ast";

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

    constructor(owner: PiElement, propertyName: string, oldValue: DecoratedModelElement, newValue: DecoratedModelElement, index?: number) {
        super(owner, propertyName, index);
        if (oldValue instanceof PiElementBaseImpl) {
            this.oldValue = oldValue;
        }
        if (newValue instanceof PiElementBaseImpl) {
            this.newValue = newValue;
        }
    }

    toString(): string {
        return "PiPartDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiRefDelta extends PiDelta {
    oldValue: PiElementReference<PiNamedElement>;
    newValue: PiElementReference<PiNamedElement>;

    constructor(owner: PiElement, propertyName: string, oldValue: PiElementReference<PiNamedElement>, newValue: DecoratedModelElement, index?: number) {
        super(owner, propertyName, index);
        this.oldValue = oldValue;
        if (newValue instanceof PiElementReference) {
            this.newValue = newValue;
        }
    }

    toString(): string {
        return "PiRefDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiListDelta extends PiDelta {
    removedCount: number;
    added: PiElement[] = [];

    constructor(owner: PiElement, propertyName: string, index: number, removedCount: number, added: DecoratedModelElement[]) {
        super(owner, propertyName, index);
        this.removedCount = removedCount;
        for(const a of added) {
            if (a instanceof PiElementBaseImpl)
                this.added.push(a);
        }
    }

    toString(): string {
        return "PiListDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class TransactionDelta extends  PiDelta {
    internalDeltas: PiDelta[] = [];

    toString(): string {
        return "TransactionDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}
