import {
    PiTyperDef,
    PitExp,
    PitStatement,
    PitStatementKind,
    PitSingleRule,
    PitSelfExp,
    PitLimitedRule,
    PitProperty,
    PitPropertyCallExp,
    PitPropertyRef,
    PitAnytypeRef,
    PitInferenceRule,
    PitInstanceRef,
    PitFunctionCallExp,
    PitAnyTypeRule,
    PitClassifierRule,
    PitConformanceOrEqualsRule,
    Applied, PitWhereExp
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

    execBeforeApplied(modelelement: Applied): boolean {
        this.output += "\nApplied: ";
        return false;
    }

    // execBeforePiInstance(modelelement: PiInstance): boolean {
    //     return false;
    // }

    execBeforePiTyperDef(modelelement: PiTyperDef): boolean {
        this.output += "PiTyperDef: " + modelelement.name;
        this.output += `\n\ttypes: {${modelelement.types.map(t => t.referred.name).join(", ")}}`;
        return false;
    }

    execBeforePitAnyTypeRule(modelelement: PitAnyTypeRule): boolean {
        this.output += "\nPitAnyTypeRule: ";
        return false;
    }

    execBeforePitAnytypeRef(modelelement: PitAnytypeRef): boolean {
        this.output += "\nPitAnytypeRef: ";
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

    execBeforePitInstanceRef(modelelement: PitInstanceRef): boolean {
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
        this.output += "\nPitPropertyCallExp: " + modelelement.myProperty.name + ": " + modelelement.myProperty.referred?.type.referred?.name;
        return false;
    }

    execBeforePitPropertyRef(modelelement: PitPropertyRef): boolean {
        this.output += "\nPitPropertyRef: " + modelelement.p.name + ": " + modelelement.p.referred?.type.referred?.name;
        return false;
    }

    execBeforePitSelfExp(modelelement: PitSelfExp): boolean {
        this.output += "\nPitSelfExp:";
        return false;
    }

    execBeforePitStatement(modelelement: PitStatement): boolean {
        this.output += "\nPitStatement: ";
        this.output += "\n\toperand: " + modelelement.operand.name;
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
