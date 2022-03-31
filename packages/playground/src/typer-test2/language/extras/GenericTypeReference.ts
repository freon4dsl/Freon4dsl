import { PiElement } from "@projectit/core";
import { GenericKind, GenericType, PiNamedReference } from "../gen";
import { PiReference } from "./PiReference";

export class GenericTypeReference<T extends GenericType> extends PiReference<T> {

    public static create<T extends GenericType>(kind: GenericKind, base: PiReference<PiElement>): GenericTypeReference<T> {
        // create the new generic type
        const xxx = GenericType.create({kind: PiNamedReference.create<GenericKind>(kind, "GenericKind"), baseType: base});
        // ??? add new type to some storage ????
        return new GenericTypeReference<T>(xxx);
    }

    private _PI_referred: GenericType = null;

    private constructor(toBeReferred: GenericType) {
        super();
        this._PI_referred = toBeReferred;
    }

    get referred(): T {
        if (!!this._PI_referred) {
            return this._PI_referred as T;
        } else {
            // TODO determine how to resolve
            return null;
        }
    }

    set referred(referredElement: T) {
        this._PI_referred = referredElement;
    }
}
