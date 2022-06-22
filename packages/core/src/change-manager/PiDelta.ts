import { DecoratedModelElement, MobxModelElementImpl, PiElement, PiElementBaseImpl, PiElementReference, PiNamedElement } from "../ast";

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
        if (oldValue instanceof MobxModelElementImpl) { // TODO adjust this test when PiElementBaseImpl is used in generation
            this.oldValue = oldValue as PiElementBaseImpl;
            // console.log("oldValue of part: " + typeof oldValue + ", " + this.oldValue.piId())
        }
        if (newValue instanceof MobxModelElementImpl) {
            this.newValue = newValue as PiElementBaseImpl;
            // console.log("newValue of part: " + typeof newValue + ", " + this.newValue.piId())
        }
    }

    toString(): string {
        return "PiPartDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiListDelta extends PiDelta {
    removed: PiElement[] = [];
    added: PiElement[] = [];

    constructor(owner: PiElement, propertyName: string, index: number, removed: DecoratedModelElement[], added: DecoratedModelElement[]) {
        super(owner, propertyName, index);
        for(const r of removed) {
            if (r instanceof PiElementBaseImpl)
                this.removed.push(r);
        }
        for(const a of added) {
            if (a instanceof PiElementBaseImpl)
                this.added.push(a);
        }
    }

    toString(): string {
        return "PiListDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiTransactionDelta extends  PiDelta {
    internalDeltas: PiDelta[] = [];

    toString(): string {
        return "TransactionDelta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}
