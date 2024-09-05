import { DecoratedModelElement, MobxModelElementImpl, FreNode, FreNodeBaseImpl, FreModelUnit } from "../ast";
import { PrimType } from "../language";

export abstract class FreDelta {
    unit: FreModelUnit;
    owner: FreNode;
    propertyName: string;
    index: number; // only used in case the changed element is (part of) a list

    constructor(unit: FreModelUnit, owner: FreNode, propertyName: string, index?: number) {
        this.owner = owner;
        this.propertyName = propertyName;
        if (index !== null && index !== undefined) {
            this.index = index;
        }
        this.unit = unit;
    }

    toString(): string {
        return "Delta<" + this.owner?.freLanguageConcept() + "[" + this.propertyName + "]>";
    }
}

export class FrePrimDelta extends FreDelta {
    oldValue: string | boolean | number;
    newValue: string | boolean | number;

    constructor(
        unit: FreModelUnit,
        owner: FreNode,
        propertyName: string,
        oldValue: string | boolean | number,
        newValue: string | boolean | number,
        index?: number,
    ) {
        super(unit, owner, propertyName, index);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    toString(): string {
        let indexStr: string = "";
        if (this.index > 0) {
            indexStr = "[" + this.index + "]";
        }
        return "set " + DeltaUtil.getElemName(this.owner) + "." + this.propertyName + indexStr + " to " + this.newValue;
    }
}

export class FrePartDelta extends FreDelta {
    oldValue: FreNode;
    newValue: FreNode;

    constructor(
        unit: FreModelUnit,
        owner: FreNode,
        propertyName: string,
        oldValue: DecoratedModelElement,
        newValue: DecoratedModelElement,
        index?: number,
    ) {
        super(unit, owner, propertyName, index);
        if (oldValue instanceof MobxModelElementImpl) {
            // TODO adjust this test when FreElementBaseImpl is used in generation
            this.oldValue = oldValue as FreNodeBaseImpl;
            // console.log("oldValue of part: " + typeof oldValue + ", " + this.oldValue.freId())
        }
        if (newValue instanceof MobxModelElementImpl) {
            this.newValue = newValue as FreNodeBaseImpl;
            // console.log("newValue of part: " + typeof newValue + ", " + this.newValue.freId())
        }
    }

    toString(): string {
        return (
            "set " +
            DeltaUtil.getElemName(this.owner) +
            "." +
            this.propertyName +
            " to " +
            DeltaUtil.getElemName(this.newValue)
        );
    }
}

export class FrePartListDelta extends FreDelta {
    removed: FreNode[] = [];
    added: FreNode[] = [];

    constructor(
        unit: FreModelUnit,
        owner: FreNode,
        propertyName: string,
        index: number,
        removed: DecoratedModelElement[],
        added: DecoratedModelElement[],
    ) {
        super(unit, owner, propertyName, index);
        for (const r of removed) {
            if (r instanceof MobxModelElementImpl) {
                // TODO adjust this test when FreElementBaseImpl is used in generation
                this.removed.push(r as FreNodeBaseImpl);
            }
        }
        for (const a of added) {
            if (a instanceof MobxModelElementImpl) {
                this.added.push(a as FreNodeBaseImpl);
            }
        }
    }

    toString(): string {
        const ownerName = DeltaUtil.getElemName(this.owner);
        if (this.removed.length > 0) {
            return `remove [${this.removed.map((r) => DeltaUtil.getElemName(r))}] from ${ownerName}.${this.propertyName}`;
        } else if (this.added.length > 0) {
            return `add [${this.added.map((r) => DeltaUtil.getElemName(r))}] to ${ownerName}.${this.propertyName}`;
        }
        return `change list ${ownerName}.${this.propertyName} from index ${this.index}: removed [${this.removed.map((r) => DeltaUtil.getElemName(r))}], added [${this.added.map((r) => DeltaUtil.getElemName(r))}]`;
    }
}

export class FrePrimListDelta extends FreDelta {
    removed: PrimType[] = [];
    added: PrimType[] = [];

    constructor(
        unit: FreModelUnit,
        owner: FreNode,
        propertyName: string,
        index: number,
        removed: PrimType[],
        added: PrimType[],
    ) {
        super(unit, owner, propertyName, index);
        if (!!removed) {
            this.removed = removed;
        }
        if (!!added) {
            this.added = added;
        }
    }

    toString(): string {
        const ownerName = DeltaUtil.getElemName(this.owner);
        if (this.removed.length > 0) {
            return `removed [${this.removed}] from ${ownerName}.${this.propertyName} from index ${this.index}`;
        } else if (this.added.length > 0) {
            return `added [${this.added}] to ${ownerName}.${this.propertyName}`;
        }
        return "FrePrimListDelta<" + ownerName + "[" + this.propertyName + "]>";
    }
}

export class FreTransactionDelta extends FreDelta {
    internalDeltas: FreDelta[] = [];

    toString(): string {
        // TODO add name and return this
        return "FreTransactionDelta<" + this.internalDeltas.map((d) => d.toString()).join("\n") + ">";
    }
}

export class DeltaUtil {
    static getElemName(node: FreNode): string {
        let ownerName: string = node["name"];
        if (!ownerName) {
            ownerName = node?.freLanguageConcept();
        }
        return ownerName;
    }
}
