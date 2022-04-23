import { makeObservable, observable } from "mobx";
import { PiOwnerDescriptor, PiElement } from "../../model";

/**
 *  An element using the decorators should implement this interface.
 *  The decorators will set the values of these properties correctly at each change.
 */
export interface DecoratedModelElement {
    $$owner: PiElement | null;
    $$propertyName: string;
    $$propertyIndex: number | undefined;
}

/**
 * Not strictly necessary, but extending this class provides a quick way to implement
 * the above interface and be able to use the decorators.
 */
// @model
export class    MobxModelElementImpl implements DecoratedModelElement {
    $$owner: PiElement | null = null;
    $$propertyName: string = "";
    $$propertyIndex: number | undefined = undefined;

    constructor() {
        makeObservable(this, {
            $$owner: observable,
            $$propertyName: observable,
            $$propertyIndex: observable
        })
    }

    piOwner(): PiElement {
        return this.$$owner;
    }

    piOwnerDescriptor(): PiOwnerDescriptor {
        const owner = this.$$owner as PiElement;
        return this.$$owner
            ? {
                  owner: owner,
                  propertyName: this.$$propertyName!,
                  propertyIndex: this.$$propertyIndex
              }
            : null;
    }
}
