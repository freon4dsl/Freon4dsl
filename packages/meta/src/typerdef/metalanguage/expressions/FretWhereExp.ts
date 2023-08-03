import { FretExp } from "./FretExp";
import { FreMetaClassifier } from "../../../languagedef/metalanguage";
import { FretVarDecl } from "../FretVarDecl";
import { FretBinaryExp } from "./FretBinaryExp";

export class FretWhereExp extends FretExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretWhereExp>): FretWhereExp {
        const result = new FretWhereExp();
        if (!!data.variable) {
            result.variable = data.variable;
        }
        if (!!data.conditions) {
            data.conditions.forEach(x => result.conditions.push(x));
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }

    readonly $typename: string = "FretWhereExp"; // holds the metatype in the form of a string
    variable: FretVarDecl; // this object is not part of the AST, it is here to embody e.g. 'x: UnitOfMeasurement'
    conditions: FretBinaryExp[] = []; // are sorted by the checker such that the left side is always the one to refer to the variable

    toFreString(): string {
        return `${this.variable.toFreString()} where {
        ${this.conditions.map(cond => cond.toFreString()).join("\n\t\t")}
    }`;
    }
    get type(): FreMetaClassifier {
        return this.variable.type;
    }
}
