import { PitProperty } from "../PitProperty";
import { PitExp } from "./PitExp";
import { PitStatement } from "./PitStatement";
import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";

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

}
