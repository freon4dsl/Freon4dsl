import {
    matchElementList,
    observablepartlist,
    FreNodeBaseImpl,
    type FreNamedNode,
    FreUtils,
    isNullOrUndefined
} from '@freon4dsl/core';
import { SimpleElement } from './SimpleElement.js';
import { makeObservable, observable } from 'mobx';

export class ElementWithList extends FreNodeBaseImpl implements FreNamedNode {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<ElementWithList>): ElementWithList {
        const result = new ElementWithList();
        if (!isNullOrUndefined(data.name)) {
            result.name = data.name;
        }
        if (!isNullOrUndefined(data.myList)) {
            data.myList.forEach((x) => result.myList.push(x));
        }
        return result;
    }

    readonly $typename: string = 'ElementWithList'; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parseLocation: FreParseLocation; // if relevant, the location of this element within the source from which it is parsed
    name: string = ''; // implementation of name
    // @ts-expect-error assigned in 'create'
    myList: SimpleElement[]; // the list!!!

    constructor(id?: string) {
        super();
        if (!isNullOrUndefined(id)) {
            this.$id = id;
        } else {
            this.$id = FreUtils.ID(); // uuid.v4();
        }
        makeObservable(this, { name: observable });

        // both 'observablepart' and 'observablelistpart' change the get and set of an attribute
        // such that the parent-part relationship is consistently maintained,
        // and make sure the part is observable
        observablepartlist(this, 'myList');
    }

    /**
     * Returns the metatype of this instance in the form of a string.
     */
    freLanguageConcept(): string {
        return this.$typename;
    }

    /**
     * Returns the unique identifier of this instance.
     */
    freId(): string {
        return this.$id;
    }

    /**
     * Returns true if this instance is a model concept.
     */
    freIsModel(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a model unit.
     */
    freIsUnit(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is an expression concept.
     */
    freIsExpression(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a binary expression concept.
     */
    freIsBinaryExpression(): boolean {
        return false;
    }
    /**
     * A convenience method that copies this instance into a new object.
     */
    copy(): ElementWithList {
        const result = new ElementWithList();
        if (!isNullOrUndefined(this.name)) {
            result.name = this.name;
        }
        if (!isNullOrUndefined(this.myList)) {
            this.myList.forEach((x) => result.myList.push(x.copy()));
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<ElementWithList>): boolean {
        let result: boolean = true;
        if (
            result &&
            toBeMatched.name !== null &&
            toBeMatched.name !== undefined &&
            toBeMatched.name.length > 0
        ) {
            result = result && this.name === toBeMatched.name;
        }
        if (result && !!toBeMatched.myList) {
            result = result && matchElementList(this.myList, toBeMatched.myList);
        }
        return result;
    }
}
