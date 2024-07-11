import { FreMetaLangElement, FreMetaEnvironment } from "./internal";
import { ParseLocation, FreMetaDefinitionElement, FreParseLocation } from "../../utils";

/**
 * Implementation for a (named) reference in Freon.
 * Reference can be set with either a referred object, or with a unitName.
 */
export class MetaElementReference<T extends FreMetaLangElement> {

    public static create<T extends FreMetaLangElement>(name: string | T, typeName: string): MetaElementReference<T> {
        const result: MetaElementReference<T> = new MetaElementReference<T>(undefined, typeName);
        if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
        }
        result.typeName = typeName;
        return result;
    }

    private _FRE_name: string = "";
    private _FRE_referred: T | undefined = undefined;

    // @ts-ignore
    public owner: FreMetaDefinitionElement;
    // @ts-ignore
    public location: ParseLocation;
    // @ts-ignore
    public aglParseLocation: FreParseLocation;

    // Need for the scoper to work
    private typeName: string = '';
    private scoper = FreMetaEnvironment.metascoper;

    private constructor(referredElement: T | undefined, typeName: string) {
        // super();
        this.referred = referredElement;
        this.typeName = typeName;
    }

    set name(value: string) {
        this._FRE_name = value;
        this._FRE_referred = undefined;
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

    set referred(referredElement: T | undefined) {
        if (!!referredElement) {
            this._FRE_name = referredElement.name;
        } else {
            this._FRE_name = "";
        }
        this._FRE_referred = referredElement;
    }
}
