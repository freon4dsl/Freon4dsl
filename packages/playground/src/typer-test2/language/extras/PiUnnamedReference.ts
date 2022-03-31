import { PiElement } from "@projectit/core";
import { PiReference } from "./PiReference";

export class PiUnnamedReference<T extends PiElement> extends PiReference<T> {
    /**
     * Returns a new instance which refers to an element named 'toBeReferred' of type T, or
     * to the element 'toBeReferred' itself.
     * @param toBeReferred
     */
    public static create<T extends PiElement>(toBeReferred: T): PiUnnamedReference<T> {
        const result = new PiUnnamedReference<T>();
        result._PI_referred = toBeReferred;
        // ??? add referred to some storage ????
        return result;
    }

    private _PI_referred: T = null;

    /**
     * The constructor is private, use the create() method
     * to make a new instance.
     */
    private constructor() {
        super();
        // makeObservable<PiElementReference<T>, "_PI_pathname" | "_PI_referred">(this, {
        //     _PI_referred: observable,
        //     _PI_pathname: observable,
        //     referred: computed,
        //     name: computed,
        //     pathname: computed
        // });
    }

    get referred(): T {
        if (!!this._PI_referred) {
            return this._PI_referred;
        } else {
            // TODO determine how to resolve
            return null;
        }
    }

    set referred(referredElement: T) {
        this._PI_referred = referredElement;
    }
}
