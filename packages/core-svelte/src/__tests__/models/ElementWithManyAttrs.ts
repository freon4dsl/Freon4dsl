import { observablepart, PiElement, PiElementBaseImpl, PiUtils } from "@projectit/core";
import { makeObservable, observable } from "mobx";

export class ElementWithManyAttrs extends PiElementBaseImpl implements PiElement  {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<ElementWithManyAttrs>): ElementWithManyAttrs {
        const result = new ElementWithManyAttrs();
        if (!!data.attr1) {
            result.attr1 = data.attr1;
        }
        if (!!data.attr2) {
            result.attr2 = data.attr2;
        }
        if (!!data.attr3) {
            result.attr3 = data.attr3;
        }
        if (!!data.attr4) {
            result.attr4 = data.attr4;
        }
        return result;
    }

    readonly $typename: string = "ElementWithManyAttrs"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parse_location: PiParseLocation; // if relevant, the location of this element within the source from which it is parsed
    attr1: string = ""; 
    attr2: string = "";
    attr3: boolean = true;
    attr4: number = 0;

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = PiUtils.ID(); // uuid.v4();
        }
        makeObservable(this, { attr1: observable, attr2: observable, attr3: observable, attr4: observable });

        // both 'observablepart' and 'observablelistpart' change the get and set of an attribute
        // such that the parent-part relationship is consistently maintained,
        // and make sure the part is observable
        observablepart(this, "myOptional");
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
    /**
     * A convenience method that copies this instance into a new object.
     */
    copy(): ElementWithManyAttrs {
        const result = new ElementWithManyAttrs();
        if (!!this.attr1) {
            result.attr1 = this.attr1;
        }
        if (!!this.attr2) {
            result.attr2 = this.attr2;
        }
        if (!!this.attr3) {
            result.attr3 = this.attr3;
        }
        if (!!this.attr4) {
            result.attr4 = this.attr4;
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<ElementWithManyAttrs>): boolean {
        let result: boolean = true;
        if (result && toBeMatched.attr1 !== null && toBeMatched.attr1 !== undefined && toBeMatched.attr1.length > 0) {
            result = result && this.attr1 === toBeMatched.attr1;
        }
        if (result && toBeMatched.attr2 !== null && toBeMatched.attr2 !== undefined && toBeMatched.attr2.length > 0) {
            result = result && this.attr2 === toBeMatched.attr2;
        }
        if (result && toBeMatched.attr3 !== null && toBeMatched.attr3 !== undefined) {
            result = result && this.attr3 === toBeMatched.attr3;
        }
        if (result && toBeMatched.attr4 !== null && toBeMatched.attr4 !== undefined) {
            result = result && this.attr4 === toBeMatched.attr4;
        }
        return result;
    }
}
