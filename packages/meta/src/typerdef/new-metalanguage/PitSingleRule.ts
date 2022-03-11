import { PiDefinitionElement } from "../../utils";
import { PitExp } from "./expressions/PitExp";
import { PitStatementKind } from "./PitStatementKind";
import { PiClassifier, PiElementReference } from "../../languagedef/metalanguage";

export class PitSingleRule extends PiDefinitionElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitSingleRule>): PitSingleRule {
        const result = new PitSingleRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (!!data.__kind) {
            result.__kind = data.__kind;
        }
        if (!!data.kind) {
            result.kind = data.kind;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    __kind: PiElementReference<PitStatementKind>;
    exp: PitExp;
    toPiString(): string {
        return `${this.__kind.name} ${this.exp.toPiString()};`;
    }
    get kind(): PitStatementKind {
        if (!!this.__kind && !!this.__kind.referred) {
            return this.__kind.referred;
        }
        return null;
    }
    set kind(cls: PitStatementKind) {
        if (!!cls) {
            this.__kind = PiElementReference.create<PitStatementKind>(cls, "PitStatementKind");
            // this.__myClassifier.owner = this.language;
        }
    }
}
