import { observableprim, FreNodeBaseImpl, type FreNamedNode, FreUtils, isNullOrUndefined } from '@freon4dsl/core';

export class DummyNode extends FreNodeBaseImpl implements FreNamedNode {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<DummyNode>): DummyNode {
        const result = new DummyNode();
        if (!isNullOrUndefined(data.name)) {
            result.name = data.name;
        }
        if (!isNullOrUndefined(data.parseLocation)) {
            result.parseLocation = data.parseLocation;
        }
        return result;
    }

    readonly $typename: string = 'DummyNode'; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parseLocation: FreParseLocation; // if relevant, the location of this element within the source from which it is parsed
    name: string; // implementation of name

    constructor(id?: string) {
        super();
        if (!isNullOrUndefined(id)) {
            this.$id = id;
        } else {
            this.$id = FreUtils.ID(); // uuid.v4();
        }
        // Both 'observableprim' and 'observableprimlist' change the get and set of the attribute
        // such that the part is observable. In lists no 'null' or 'undefined' values are allowed.
        observableprim(this, 'name');
        this.name = '';
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
    copy(): DummyNode {
        const result = new DummyNode();
        if (!isNullOrUndefined(this.name)) {
            result.name = this.name;
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<DummyNode>): boolean {
        let result: boolean = true;
        if (
            result &&
            toBeMatched.name !== null &&
            toBeMatched.name !== undefined &&
            toBeMatched.name.length > 0
        ) {
            result = result && this.name === toBeMatched.name;
        }
        return result;
    }
}
