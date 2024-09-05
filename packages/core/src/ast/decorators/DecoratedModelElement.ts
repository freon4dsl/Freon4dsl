import { makeObservable, observable } from "mobx";
import { FreOwnerDescriptor, FreNode } from "..";

/**
 *  An element using the decorators should implement this interface.
 *  The decorators will set the values of these properties correctly at each change.
 */
export interface DecoratedModelElement {
    $$owner: FreNode | null;
    $$propertyName: string;
    $$propertyIndex: number | undefined;
}

/**
 * Not strictly necessary, but extending this class provides a quick way to implement
 * the above interface and be able to use the decorators.
 */
// @model
export class MobxModelElementImpl implements DecoratedModelElement {
    $$owner: FreNode | null = null;
    $$propertyName: string = "";
    $$propertyIndex: number | undefined = undefined;

    constructor() {
        makeObservable(this, {
            $$owner: observable,
            $$propertyName: observable,
            $$propertyIndex: observable,
        });
    }

    freOwner(): FreNode {
        return this.$$owner;
    }

    freOwnerDescriptor(): FreOwnerDescriptor {
        const owner = this.$$owner as FreNode;
        return this.$$owner
            ? {
                  owner: owner,
                  propertyName: this.$$propertyName!,
                  propertyIndex: this.$$propertyIndex,
              }
            : null;
    }
}

export function allOwners(dec: FreNode): FreNode[] {
    const result = [];
    let owner = dec?.freOwner();

    while (!!owner) {
        result.push(owner);
        owner = owner.freOwner();
    }
    return result;
}
