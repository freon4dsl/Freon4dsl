import { observablepart, PiElement, PiElementBaseImpl, PiUtils } from "@projectit/core";
import { makeObservable, observable } from "mobx";

export class ElementWithText extends PiElementBaseImpl implements PiElement  {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<ElementWithText>): ElementWithText {
        const result = new ElementWithText();
        if (!!data.myText1) {
            result.myText1 = data.myText1;
        }
        if (!!data.myText2) {
            result.myText2 = data.myText2;
        }
        return result;
    }

    readonly $typename: string = "ElementWithText"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parse_location: PiParseLocation; // if relevant, the location of this element within the source from which it is parsed
    myText1: string = ""; // implementation of myText1
    myText2: string = ""; // implementation of myText2

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = PiUtils.ID(); // uuid.v4();
        }
        makeObservable(this, { myText1: observable, myText2: observable });

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
    copy(): ElementWithText {
        const result = new ElementWithText();
        if (!!this.myText1) {
            result.myText1 = this.myText1;
        }
        if (!!this.myText2) {
            result.myText2 = this.myText2;
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<ElementWithText>): boolean {
        let result: boolean = true;
        if (result && toBeMatched.myText1 !== null && toBeMatched.myText1 !== undefined && toBeMatched.myText1.length > 0) {
            result = result && this.myText1 === toBeMatched.myText1;
        }
        if (result && toBeMatched.myText2 !== null && toBeMatched.myText2 !== undefined && toBeMatched.myText2.length > 0) {
            result = result && this.myText2 === toBeMatched.myText2;
        }
        return result;
    }
}
