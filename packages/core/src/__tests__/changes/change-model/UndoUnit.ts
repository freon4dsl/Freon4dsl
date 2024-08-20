/**
 * Class UndoUnit is the implementation of the model unit with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to the changes in the state of its properties.
 */
import {
    observablepart,
    observablepartlist,
    observableprim,
    observableprimlist,
    FreNodeBaseImpl,
    FreModelUnit,
} from "../../../ast";
import { UndoPart } from "./UndoPart";
import { FreUtils } from "../../../util";
import { FreLogger } from "../../../logging";

const LOGGER = new FreLogger("UndoUnit");

export class UndoUnit extends FreNodeBaseImpl implements FreModelUnit {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<UndoUnit>): UndoUnit {
        const result = new UndoUnit();
        if (!!data.prim) {
            result.prim = data.prim;
        }
        if (!!data.numlist) {
            data.numlist.forEach((x) => result.numlist.push(x));
        }
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.part) {
            result.part = data.part;
        }
        if (!!data.partlist) {
            data.partlist.forEach((x) => result.partlist.push(x));
        }
        if (!!data.parseLocation) {
            result.parseLocation = data.parseLocation;
        }
        return result;
    }

    fileExtension: string;
    readonly $typename: string = "UndoUnit"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    prim: string; // implementation of prim
    numlist: number[]; // implementation of numlist
    name: string; // implementation of name
    part: UndoPart; // implementation of part 'part'
    partlist: UndoPart[]; // implementation of part 'partlist'

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = FreUtils.ID(); // uuid.v4();
        }
        // Both 'observableprim' and 'observableprimlist' change the get and set of the attribute
        // such that the part is observable. In lists no 'null' or 'undefined' values are allowed.
        observableprim(this, "prim");
        this.prim = "";
        observableprimlist(this, "numlist");
        observableprim(this, "name");
        this.name = "";

        // Both 'observablepart' and 'observablepartlist' change the get and set of the attribute
        // such that the parent-part relationship is consistently maintained,
        // and make sure the part is observable. In lists no 'null' or 'undefined' values are allowed.
        observablepart(this, "part");
        observablepartlist(this, "partlist");
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
        return true;
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
    copy(): UndoUnit {
        const result = new UndoUnit();
        if (!!this.prim) {
            result.prim = this.prim;
        }
        if (!!this.numlist) {
            this.numlist.forEach((x) => result.numlist.push(x));
        }
        if (!!this.name) {
            result.name = this.name;
        }
        if (!!this.part) {
            result.part = this.part.copy();
        }
        if (!!this.partlist) {
            this.partlist.forEach((x) => result.partlist.push(x.copy()));
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    // @ts-ignore
    public match(toBeMatched: Partial<UndoUnit>): boolean {
        LOGGER.log("function UndoUnit.match needs to be implemented");
        // let result: boolean = true;
        // if (result && toBeMatched.prim !== null && toBeMatched.prim !== undefined && toBeMatched.prim.length > 0) {
        //     result = result && this.prim === toBeMatched.prim;
        // }
        // if (result && !!toBeMatched.numlist) {
        //     result = result && matchPrimitiveList(this.numlist, toBeMatched.numlist);
        // }
        // if (result && toBeMatched.name !== null && toBeMatched.name !== undefined && toBeMatched.name.length > 0) {
        //     result = result && this.name === toBeMatched.name;
        // }
        // if (result && !!toBeMatched.part) {
        //     result = result && this.part.match(toBeMatched.part);
        // }
        // if (result && !!toBeMatched.partlist) {
        //     result = result && matchElementList(this.partlist, toBeMatched.partlist);
        // }
        // return result;
        return true;
    }
}
