import { MobxTestElement } from "./MobxModel";
import { TestScoper } from "./TestScoper";
import { MobxModelElementImpl } from "../DecoratedModelElement";
import { computed, observable, makeObservable } from "mobx";

export class PiElementReferenceM<T extends MobxTestElement> extends MobxModelElementImpl {
    private _PI_name: string = "UNKNOWN";
    private _PI_referred: T = null;

    // Need for the scoper to work
    private typeName: string;

    public constructor(referredElement: T) {
        super();
        this.referred = referredElement;
        makeObservable<PiElementReferenceM<T>, "_PI_name" | "_PI_referred">(this, {
           _PI_referred: observable,
           _PI_name: observable,
           referred: computed,
            name: computed
        });
    }

    set name(value: string) {
        this._PI_name = value;
        this._PI_referred = null;
        // this._PI_referred = TestScoper.getInstance().getFromVisibleElements(value) as T;
    }

    get name(): string {
        if (!!this._PI_referred) {
            this._PI_name = this._PI_referred.name;
        } else {
            this._PI_referred = TestScoper.getInstance().getFromVisibleElements(this._PI_name) as T;
        }
        return this._PI_name;
    }

    get referred(): T {
        if (!!this._PI_referred) {
            return this._PI_referred;
        } else {
            this._PI_referred = TestScoper.getInstance().getFromVisibleElements(this._PI_name) as T;
        }
        return this._PI_referred;
    }

    set referred(referredElement) {
        if (!!referredElement) {
            this._PI_name = referredElement.name;
        } else {
            this._PI_name = "";
        }
        this._PI_referred = referredElement;
    }

    public static createNamedReference<T extends MobxTestElement>(name: string, typeName: string): PiElementReferenceM<T> {
        const result = new PiElementReferenceM(null);
        result.name = name;
        result.typeName = typeName;
        return result;
    }

    public static create<T extends MobxTestElement>(name: string | T, typeName: string): PiElementReferenceM<T> {
        const result = new PiElementReferenceM(null);
        if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
        }
        result.typeName = typeName;
        return result;
    }
}
