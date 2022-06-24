import {
    DecoratedModelElement,
    MobxModelElementImpl,
    PiElement,
    PiElementBaseImpl,
    PiModelUnit,
} from "../ast";
import { PrimType } from "../language";

export abstract class PiDelta {
    unit: PiModelUnit;
    owner: PiElement;
    propertyName: string;
    index: number; // only used in case the changed element is (part of) a list

    constructor(unit: PiModelUnit, owner: PiElement, propertyName: string, index?: number) {
        this.owner = owner;
        this.propertyName = propertyName;
        if (index !== null && index !== undefined) {
            this.index = index;
        }
        this.unit = unit;
    }

    toString(): string {
        return "Delta<" + this.owner?.piLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class PiPrimDelta extends PiDelta {
    oldValue: string | boolean | number;
    newValue: string | boolean | number;

    constructor(unit: PiModelUnit, owner: PiElement, propertyName: string, oldValue: string | boolean | number, newValue: string | boolean | number, index?: number) {
        super(unit, owner, propertyName, index);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    toString(): string {
        let indexStr: string = '';
        if (this.index > 0) {
            indexStr = "[" + this.index + "]";
        }
        return "set " + DeltaUtil.getElemName(this.owner) + "." + this.propertyName + indexStr + " to " + this.newValue;
    }
}

export class PiPartDelta extends PiDelta {
    oldValue: PiElement;
    newValue: PiElement;

    constructor(unit: PiModelUnit, owner: PiElement, propertyName: string, oldValue: DecoratedModelElement, newValue: DecoratedModelElement, index?: number) {
        super(unit, owner, propertyName, index);
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
        return "set " + DeltaUtil.getElemName(this.owner) + "." + this.propertyName + " to " + DeltaUtil.getElemName(this.newValue);
    }
}

export class PiPartListDelta extends PiDelta {
    removed: PiElement[] = [];
    added: PiElement[] = [];

    constructor(unit: PiModelUnit, owner: PiElement, propertyName: string, index: number, removed: DecoratedModelElement[], added: DecoratedModelElement[]) {
        super(unit, owner, propertyName, index);
        for (const r of removed) {
            if (r instanceof MobxModelElementImpl) { // TODO adjust this test when PiElementBaseImpl is used in generation
                this.removed.push(r as PiElementBaseImpl);
            }
        }
        for (const a of added) {
            if (a instanceof MobxModelElementImpl) {
                this.added.push(a as PiElementBaseImpl);
            }
        }
    }

    toString(): string {
        let ownerName = DeltaUtil.getElemName(this.owner);
        if (this.removed.length > 0) {
            return `remove [${this.removed.map(r => DeltaUtil.getElemName(r))}] from ${ownerName}.${this.propertyName}`;
        } else if (this.added.length > 0) {
            return `add [${this.added.map(r => DeltaUtil.getElemName(r))}] to ${ownerName}.${this.propertyName}`;
        }
        return `change list ${ownerName}.${this.propertyName} from index ${this.index}: removed [${this.removed.map(r => DeltaUtil.getElemName(r))}], added [${this.added.map(r => DeltaUtil.getElemName(r))}]`;
    }
}

export class PiPrimListDelta extends PiDelta {
    removed: PrimType[] = [];
    added: PrimType[] = [];

    constructor(unit: PiModelUnit, owner: PiElement, propertyName: string, index: number, removed: PrimType[], added: PrimType[]) {
        super(unit, owner, propertyName, index);
        if (!!removed) {
            this.removed = removed;
        }
        if (!!added) {
            this.added = added;
        }
    }

    toString(): string {
        let ownerName = DeltaUtil.getElemName(this.owner);
        if (this.removed.length > 0) {
            return `removed [${this.removed}] from ${ownerName}.${this.propertyName} from index ${this.index}`;
        } else if (this.added.length > 0) {
            return `added [${this.added}] to ${ownerName}.${this.propertyName}`;
        }
        return "PiPrimListDelta<" + ownerName + "[" + this.propertyName + "]>";
    }
}

export class PiTransactionDelta extends PiDelta {
    internalDeltas: PiDelta[] = [];

    toString(): string {
        // TODO add name and return this
        return "PiTransactionDelta<" + this.internalDeltas.map(d => d.toString()).join("\n") + ">";
    }
}

export class DeltaUtil {
    static getElemName(element: PiElement): string {
        let ownerName: string = element["name"];
        if (!ownerName) {
            ownerName = element?.piLanguageConcept();
        }
        return ownerName;
    }
}
