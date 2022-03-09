import {
    PiTyperDef,
    PitStatement,
    PitStatementKind,
    PitSingleRule,
    PitSelfExp,
    PitLimitedRule,
    PitProperty,
    PitPropertyCallExp,
    PitInferenceRule,
    PitInstanceExp,
    PitFunctionCallExp,
    PitAnyTypeRule,
    PitClassifierRule,
    PitConformanceOrEqualsRule,
    PitAppliedExp, PitWhereExp, PitAnytypeExp
} from "../language/gen";
import { PiLanguageDefaultWorker, PiLanguageWalker } from "../utils/gen";

export class StructurePrint extends PiLanguageDefaultWorker {
    output: string = "";

    public print(modelelement: PiTyperDef) {

        // create the walker over the model tree
        const myWalker = new PiLanguageWalker();
        myWalker.myWorkers.push(this);

        // do the work
        myWalker.walk(modelelement, () => {
            return true;
        });

        console.log(this.output);
    }

    execBeforePitAppliedExp(modelelement: PitAppliedExp): boolean {
        this.output += "\nPitAppliedExp: ";
        return false;
    }

    execBeforePiTyperDef(modelelement: PiTyperDef): boolean {
        this.output += "PiTyperDef: " + modelelement.name;
        this.output += `\n\ttypes: {${modelelement.types.map(t => t.name).join(", ")}}`;
        return false;
    }

    execBeforePitAnyTypeRule(modelelement: PitAnyTypeRule): boolean {
        this.output += "\nPitAnyTypeRule: ";
        return false;
    }

    execBeforePitAnytypeExp(modelelement: PitAnytypeExp): boolean {
        this.output += "\nPitAnytypeExp: ";
        return false;
    }

    execBeforePitClassifierRule(modelelement: PitClassifierRule): boolean {
        this.output += "\nPitClassifierRule: " + modelelement.myClassifier.name;
        return false;
    }

    execBeforePitConformanceOrEqualsRule(modelelement: PitConformanceOrEqualsRule): boolean {
        this.output += "\nPitConformanceOrEqualsRule: " + modelelement.myClassifier.name;
        return false;
    }

    // execBeforePitExp(modelelement: PitExp): boolean {
    //     return false;
    // }

    execBeforePitFunctionCallExp(modelelement: PitFunctionCallExp): boolean {
        this.output += "\nPitFunctionCallExp: " + modelelement.calledFunction;
        return false;
    }

    execBeforePitInferenceRule(modelelement: PitInferenceRule): boolean {
        this.output += "\nPitInferenceRule: " + modelelement.myClassifier.name;
        return false;
    }

    execBeforePitInstanceExp(modelelement: PitInstanceExp): boolean {
        this.output += "\nPitInstanceRef: " + modelelement.myLimited?.name + ":" + modelelement.myInstance.name;
        return false;
    }

    execBeforePitLimitedRule(modelelement: PitLimitedRule): boolean {
        this.output += "\nPitLimitedRule: ";
        return false;
    }

    execBeforePitWhereExp(modelelement: PitWhereExp): boolean {
        this.output += "\nPitWhereExp: ";
        return false;
    }

    execBeforePitProperty(modelelement: PitProperty): boolean {
        this.output += "\nPitProperty: " + modelelement.name;
        this.output += "\n\ttype: " + modelelement.type.name;
        return false;
    }

    execBeforePitPropertyCallExp(modelelement: PitPropertyCallExp): boolean {
        this.output += "\nPitPropertyCallExp: " + modelelement.property.name + ": " + modelelement.property.referred?.type.referred?.name;
        return false;
    }

    execBeforePitSelfExp(modelelement: PitSelfExp): boolean {
        this.output += "\nPitSelfExp:";
        return false;
    }

    execBeforePitStatement(modelelement: PitStatement): boolean {
        this.output += "\nPitStatement: ";
        return false;
    }

    execBeforePitStatementKind(modelelement: PitStatementKind): boolean {
        this.output += "\nPitStatementKind: " + modelelement.name;
        return false;
    }

    execBeforePitSingleRule(modelelement: PitSingleRule): boolean {
        this.output += "\nPitSingleRule: " + modelelement.kind.name
        return false;
    }
}
