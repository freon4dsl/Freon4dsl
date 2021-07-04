import { MobxModelElementImpl, observablelistpart, PiNamedElement } from "@projectit/core";
import { observable } from "mobx";
import * as uuid from "uuid";
import type { SvelteAttribute } from "./SvelteAttribute";

export class SvelteEntity extends MobxModelElementImpl implements PiNamedElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<SvelteEntity>): SvelteEntity {
        const result = new SvelteEntity();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.attributes) {
            data.attributes.forEach(x => result.attributes.push(x));
        }
        // if (!!data.methods) {
        //     data.methods.forEach(x => result.methods.push(x));
        // }
        // if (!!data.baseEntity) {
        //     result.baseEntity = data.baseEntity;
        // }
        return result;
    }

    readonly $typename: string = "Entity"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    @observable name: string = ""; // implementation of name
    @observablelistpart attributes: SvelteAttribute[]; // implementation of attributes
    // @observablepart baseEntity: PiElementReference<Entity>; // implementation of baseEntity

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
