import { PitExp } from "./PitExp";
import { FreClassifier } from "../../../languagedef/metalanguage";
import { PitVarDecl } from "../PitVarDecl";
import { PitBinaryExp } from "./PitBinaryExp";
import { PitPropertyCallExp } from "./PitPropertyCallExp";
import { PitVarCallExp } from "./PitVarCallExp";
import { PitEqualsExp } from "./PitEqualsExp";
import { PitConformsExp } from "./PitConformsExp";

export class PitWhereExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitWhereExp>): PitWhereExp {
        const result = new PitWhereExp();
        if (!!data.variable) {
            result.variable = data.variable;
        }
        if (!!data.conditions) {
            data.conditions.forEach(x => result.conditions.push(x));
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitWhereExp"; // holds the metatype in the form of a string
    variable: PitVarDecl; // this object is not part of the AST, it is here to embody e.g. 'x: UnitOfMeasurement'
    conditions: PitBinaryExp[] = []; // are sorted by the checker such that the left side is always the one to refer to the variable

    toPiString(): string {
        return `${this.variable.toPiString()} where {
        ${this.conditions.map(cond => cond.toPiString()).join("\n\t\t")}
    }`;
    }
    get type(): FreClassifier {
        return this.variable.type;
    }
}
