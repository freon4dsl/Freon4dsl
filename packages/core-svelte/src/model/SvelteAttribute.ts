import { MobxModelElementImpl, PiNamedElement } from "@projectit/core";
import { observable } from "mobx";
import * as uuid from "uuid";

export class SvelteAttribute extends MobxModelElementImpl implements PiNamedElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<SvelteAttribute>): SvelteAttribute {
        const result = new SvelteAttribute();
        if (!!data.name) {
            result.name = data.name;
        }
        // if (!!data.declaredType) {
        //     result.declaredType = data.declaredType;
        // }
        return result;
    }

    readonly $typename: string = "Attribute"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    @observable name: string = ""; // implementation of name
    @observable type: string = "";

    // @observablepart declaredType: PiElementReference<Type>; // implementation of declaredType

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = uuid.v4();
        }
    }

    /**
     * Returns the metatype of this instance in the form of a string.
     */
    piLanguageConcept(): string {
        return this.$typename;
    }

    /**
     * Returns the unique identifier of this instance.
     */
    piId(): string {
        return this.$id;
    }

    /**
     * Returns true if this instance is a model concept.
     */
    piIsModel(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a model unit.
     */
    piIsUnit(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is an expression concept.
     */
    piIsExpression(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a binary expression concept.
     */
    piIsBinaryExpression(): boolean {
        return false;
    }
}
