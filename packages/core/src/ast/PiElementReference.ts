import { MobxModelElementImpl, PiNamedElement } from ".";
import { computed, observable, makeObservable, trace } from "mobx";
import { LanguageEnvironment } from "../environment/LanguageEnvironment";
import { PiLogger } from "../util/index";

const LOGGER = new PiLogger("PiElementReference").mute();
/**
 * Class PiElementReference provides the implementation for a (named) reference in ProjectIt.
 * References can be set with either a referred object, or with a name.
 */
export class PiElementReference<T extends PiNamedElement> extends MobxModelElementImpl {
    /**
     * Returns a new instance which refers to an element named 'name' of type T, or
     * to the element 'name' itself.
     * Param 'typeName' should be equal to T.constructor.name.
     * @param name
     * @param typeName
     */
    public static create<T extends PiNamedElement>(name: string | string[] | T, typeName: string): PiElementReference<T> {
        const result = new PiElementReference(null, typeName);
        if (Array.isArray(name)) {
            result.pathname = name;
        } else if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
        }
        result.typeName = typeName;
        return result;
    }

    private _PI_pathname: string[] = [];
    private _PI_referred: T = null;

    // Needed for the scoper to work
    public typeName: string = "";

    /**
     * The constructor is private, use the create() method
     * to make a new instance.
     * @param referredElement
     * @param typeName
     */
    private constructor(referredElement: T, typeName: string) {
        super();
        this.referred = referredElement;
        this.typeName = typeName;
        makeObservable<PiElementReference<T>, "_PI_pathname" | "_PI_referred">(this, {
            _PI_referred: observable,
            _PI_pathname: observable,
            referred: computed,
            // name: computed,
            // pathname: computed
        });
    }

    set name(value: string) {
        this._PI_pathname = [value];
        this._PI_referred = null;
    }

    set pathname(value: string[]) {
        this._PI_pathname = value;
        this._PI_referred = null;
    }

    get name(): string {
        return this._PI_pathname[this._PI_pathname.length - 1];
    }

    get pathname(): string[] {
        let result: string[] = [];
        for (const elem of this._PI_pathname) {
            result.push(elem);
        }
        return result;
    }

    pathnameToString(separator: string): string {
        let result: string = "";
        for (let index = 0; index < this._PI_pathname.length; index++) {
            let str = this._PI_pathname[index];
            if (index === this._PI_pathname.length - 1) {
                result += str;
            } else {
                result += str + separator;
            }
        }
        return result;
    }

    get referred(): T {
        LOGGER.log("PiElementReference " + this._PI_pathname + " property " + this.piOwnerDescriptor().propertyName + " owner " + this.piOwnerDescriptor().owner.piLanguageConcept());
        if (!!this._PI_referred) {
           return this._PI_referred;
       } else {
            return LanguageEnvironment.getInstance().scoper.resolvePathName(
                this.piOwnerDescriptor().owner,
                this.piOwnerDescriptor().propertyName,
                this._PI_pathname,
                this.typeName
            ) as T;
        }
    }

    set referred(referredElement) {
        if (!!referredElement) {
            this._PI_pathname.push(referredElement.name);
        }
        this._PI_referred = referredElement;
    }

    /**
     * Returns true if this reference has the same name as 'toBeMatched'.
     * @param toBeMatched
     */
    match(toBeMatched: Partial<PiElementReference<T>>): boolean {
        return toBeMatched.name === this.name;
    }
}
