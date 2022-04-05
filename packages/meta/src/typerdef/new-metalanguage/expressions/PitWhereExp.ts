import { PitProperty } from "../PitProperty";
import { PitExp } from "./PitExp";
import { PitStatement } from "./PitStatement";
import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { PitPropertyCallExp } from "./PitPropertyCallExp";
import { TyperGenUtils } from "../../new-generator/templates/TyperGenUtils";
import { PitEquals } from "./PitEquals";
import { PitConforms } from "./PitConforms";

export class PitWhereExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitWhereExp>): PitWhereExp {
        const result = new PitWhereExp();
        if (!!data.otherType) {
            result.otherType = data.otherType;
        }
        if (!!data.conditions) {
            data.conditions.forEach(x => result.conditions.push(x));
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    otherType: PitProperty; // this object is not part of the AST, it is here to embody e.g. 'x: UnitOfMeasurement'
    conditions: PitStatement[] = [];
    toPiString(): string {
        return `${this.otherType.toPiString()} where {
                ${this.conditions.map(cond => cond.toPiString()).join("\n")}
            }`;
    }
    get type(): PiClassifier {
        return this.otherType.type;
    }
    baseSource(): PitExp {
        return this;
    }

    /**
     * Returns the conditions of the expressions such that the part that refers to the extra variable
     * is always the left.
     */
    sortedConditions(): PitStatement[] {
        const result: PitStatement[] = [];
        this.conditions.forEach(cond => {
            // which part of the condition refers to 'otherType'
            let otherTypePart: PitExp;
            let knownTypePart: PitExp;
            let baseSource = cond.left.baseSource();
            if (baseSource instanceof PitPropertyCallExp && baseSource.property === this.otherType) {
                otherTypePart = cond.left;
                knownTypePart = cond.right;
            } else {
                baseSource = cond.right.baseSource();
                if (baseSource instanceof PitPropertyCallExp && baseSource.property === this.otherType) {
                    otherTypePart = cond.right;
                    knownTypePart = cond.left;
                }
            }
            // strip the source from part that refers to the extra variable
            otherTypePart = TyperGenUtils.removeBaseSource(otherTypePart);
            // return a new condition with the knownTypePart always as the right
            if (cond instanceof PitEquals) {
                result.push(PitEquals.create({left: otherTypePart, right: knownTypePart}));
            } else if (cond instanceof PitConforms) {
                result.push(PitConforms.create({left: otherTypePart, right: knownTypePart}));
            }
        });
        return result;
    }

}
