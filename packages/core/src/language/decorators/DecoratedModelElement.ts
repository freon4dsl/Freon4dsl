import { makeObservable, observable } from "mobx";
import { PiContainerDescriptor } from "../PiContainerDescriptor";
import { PiElement } from "../PiElement";
import { model } from "./MobxModelDecorators";

/**
 *  An element using the decorators should implement this interface.
 *  The decorators will set the values of these properties correctly at each change.
 */
export interface DecoratedModelElement {
    container: PiElement | null;
    propertyName: string;
    propertyIndex: number | undefined;
}

/**
 * Not strictly neccesary, but extending this class provides a quick way to implement
 * the above interface and be able to use the decorators.
 */
// @model
export class    MobxModelElementImpl implements DecoratedModelElement {
    container: PiElement | null = null;
    propertyName: string = "";
    propertyIndex: number | undefined = undefined;

    constructor() {
        makeObservable(this, {
            container: observable,
            propertyName: observable,
            propertyIndex: observable
        })
    }
    piContainer(): PiContainerDescriptor {
        const container = this.container as PiElement;
        return this.container
            ? {
                  container: container,
                  propertyName: this.propertyName!,
                  propertyIndex: this.propertyIndex
              }
            : null;
    }
}
