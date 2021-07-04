import { MobxModelElementImpl, observablelistpart, PiNamedElement } from "@projectit/core";
import { observable } from "mobx";
import * as uuid from "uuid";
import type { SvelteEntity } from "./SvelteEntity";

export class SvelteModelUnit extends MobxModelElementImpl implements PiNamedElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<SvelteModelUnit>): SvelteModelUnit {
        const result = new SvelteModelUnit();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.entities) {
            data.entities.forEach(x => result.entities.push(x));
        }
        // if (!!data.methods) {
        //     data.methods.forEach(x => result.methods.push(x));
        // }
        return result;
    }

    readonly $typename: string = "SvelteModelUnit"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    @observable name: string = ""; // implementation of name
    @observablelistpart entities: SvelteEntity[]; // implementation of entities

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
        return true;
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
