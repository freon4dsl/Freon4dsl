import { FreLangElement, FreMetaEnvironment } from "./internal";
import { ParseLocation, FreDefinitionElement, FreParseLocation } from "../../utils";

/**
 * Implementation for a (named) reference in Freon.
 * Reference can be set with either a referred object, or with a unitName.
 */
export class MetaElementReference<T extends FreLangElement> {

    public static create<T extends FreLangElement>(name: string | T, typeName: string): MetaElementReference<T> {
        const result = new MetaElementReference(null, typeName);
        if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
        }
        result.typeName = typeName;
        return result;
    }

    private _FRE_name: string = "";
    private _FRE_referred: T = null;

    public owner: FreDefinitionElement;
    public location: ParseLocation;
    public agl_location: FreParseLocation;

    // Need for the scoper to work
    private typeName: string;
    private scoper = FreMetaEnvironment.metascoper;

    private constructor(referredElement: T, typeName: string) {
        // super();
        this.referred = referredElement;
        this.typeName = typeName;
    }

    set name(value: string) {
        this._FRE_name = value;
        this._FRE_referred = null;
    }

    get name(): string {
        if (!!this._FRE_referred) {
            return this.referred.name;
        }
        return this._FRE_name;
    }

    get referred(): T {
        if (!!this._FRE_referred) {
            return this._FRE_referred;
        } else {
            this._FRE_referred = this.scoper.getFromVisibleElements(
                this.owner,
                this._FRE_name,
                this.typeName
            ) as T;
        }
        return this._FRE_referred;
    }

    set referred(referredElement) {
        if (!!referredElement) {
            this._FRE_name = referredElement.name;
        } else {
            this._FRE_name = "";
        }
        this._FRE_referred = referredElement;
    }
}
