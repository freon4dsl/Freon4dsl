import { matchElementList, observablepart, observablepartlist, PiElementBaseImpl, PiNamedElement, PiUtils } from "@projectit/core";
import { SimpleElement } from "./SimpleElement";
import { makeObservable, observable } from "mobx";

export class ElementWithList extends PiElementBaseImpl implements PiNamedElement  {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<ElementWithList>): ElementWithList {
        const result = new ElementWithList();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.myList) {
            data.myList.forEach(x => result.myList.push(x));
        }
        return result;
    }

    readonly $typename: string = "ElementWithList"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parse_location: PiParseLocation; // if relevant, the location of this element within the source from which it is parsed
    name: string = ""; // implementation of name
    myList: SimpleElement[]; // the list!!!

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = PiUtils.ID(); // uuid.v4();
        }
        makeObservable(this, { name: observable });

        // both 'observablepart' and 'observablelistpart' change the get and set of an attribute
        // such that the parent-part relationship is consistently maintained,
        // and make sure the part is observable
        observablepartlist(this, "myList");
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
    copy(): ElementWithList {
        const result = new ElementWithList();
        if (!!this.name) {
            result.name = this.name;
        }
        if (!!this.myList) {
            this.myList.forEach(x => result.myList.push(x.copy()));
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
        if (result && toBeMatched.name !== null && toBeMatched.name !== undefined && toBeMatched.name.length > 0) {
            result = result && this.name === toBeMatched.name;
        }
        if (result && !!toBeMatched.myList) {
            result = result && matchElementList(this.myList, toBeMatched.myList);
        }
        return result;
    }
}
