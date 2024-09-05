import { FreNamedNode } from "../../ast";
import { computed, observable, makeObservable } from "mobx";
import { TestScoper } from "./TestScoper";
import { FreLogger } from "../../logging";
import { MobxModelElementImpl } from "../../ast";

const LOGGER = new FreLogger("FreNodeReference").mute();
/**
 * Class FreNodeReference provides the implementation for a (named) reference in Freon.
 * References can be set with either a referred object, or with a name.
 * This class is a copy of FreNodeReference - because it needs to use a different scoper.
 * The only difference with the original is (should be) the call to the scoper in 'get referred()'.
 */
export class FreNodeReferenceTestScoper<T extends FreNamedNode> extends MobxModelElementImpl {
    /**
     * Returns a new instance which refers to an element named 'name' of type T, or
     * to the element 'name' itself.
     * Param 'typeName' should be equal to T.constructor.name.
     * @param name
     * @param typeName
     */
    public static create<T extends FreNamedNode>(
        name: string | string[] | T,
        typeName: string,
    ): FreNodeReferenceTestScoper<T> {
        const result = new FreNodeReferenceTestScoper(null, typeName);
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

    // tslint:disable-next-line:no-shadowed-variable
    public copy<T extends FreNamedNode>(): FreNodeReferenceTestScoper<T> {
        return FreNodeReferenceTestScoper.create<T>(this._FRE_pathname, this.typeName);
    }

    private _FRE_pathname: string[] = [];
    private _FRE_referred: T = null;

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
        makeObservable<FreNodeReferenceTestScoper<T>, "_FRE_pathname" | "_FRE_referred">(this, {
            _FRE_referred: observable,
            _FRE_pathname: observable,
            referred: computed,
            // name: computed,
            // pathname: computed
        });
    }

    set name(value: string) {
        this._FRE_pathname = [value];
        this._FRE_referred = null;
    }

    get name(): string {
        return this._FRE_pathname[this._FRE_pathname.length - 1];
    }

    set pathname(value: string[]) {
        this._FRE_pathname = value;
        this._FRE_referred = null;
    }

    get pathname(): string[] {
        const result: string[] = [];
        for (const elem of this._FRE_pathname) {
            result.push(elem);
        }
        return result;
    }

    pathnameToString(separator: string): string {
        let result: string = "";
        for (let index = 0; index < this._FRE_pathname.length; index++) {
            const str = this._FRE_pathname[index];
            if (index === this._FRE_pathname.length - 1) {
                result += str;
            } else {
                result += str + separator;
            }
        }
        return result;
    }

    get referred(): T {
        LOGGER.log(
            "FreNodeReference " +
                this._FRE_pathname +
                " property " +
                this.freOwnerDescriptor().propertyName +
                " owner " +
                this.freOwnerDescriptor().owner.freLanguageConcept(),
        );
        if (!!this._FRE_referred) {
            return this._FRE_referred;
        } else {
            // this line is different from the 'true' FreNodeReference
            return TestScoper.getInstance().getFromVisibleElements(this.name) as T;
        }
    }

    set referred(referredElement) {
        if (!!referredElement) {
            this._FRE_pathname.push(referredElement.name);
        }
        this._FRE_referred = referredElement;
    }

    /**
     * Returns true if this reference has the same name as 'toBeMatched'.
     * @param toBeMatched
     */
    match(toBeMatched: Partial<FreNodeReferenceTestScoper<T>>): boolean {
        return toBeMatched.name === this.name;
    }
}
