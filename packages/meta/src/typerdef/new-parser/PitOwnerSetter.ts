import {
    PitAnytypeExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp,
    PitPropertyCallExp, PitSelfExp,
    PitWhereExp,
    PiTyperDef, PiTyperElement
} from "../new-metalanguage";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../new-metalanguage/expressions";

export class PitOwnerSetter {
    static setNodeOwners(typeDef: PiTyperDef) {
        typeDef.classifierSpecs.forEach(spec => {
            spec.rules.forEach(rule => {
                this.setOwner(rule.exp, rule);
                rule.owner = spec;
            });
            spec.owner = typeDef;
        });
    }

    private static setOwner(exp: PitExp, owner: PiTyperElement) {
        exp.owner = owner;
        if (exp instanceof PitAnytypeExp ) {
        } else if (exp instanceof PitBinaryExp) {
            this.setOwner(exp.left, exp);
            this.setOwner(exp.right, exp);
        } else if (exp instanceof PitCreateExp) {
            exp.propertyDefs.forEach(propDef => {
                this.setOwner(propDef.value, propDef);
                propDef.__property.owner = exp;
                propDef.owner = exp;
            });
        } else if (exp instanceof PitFunctionCallExp) {
            exp.actualParameters.forEach(par => {
               this.setOwner(par, exp);
            });
        } else if (exp instanceof PitLimitedInstanceExp) {
            exp.__myInstance.owner = exp;
            exp.__myLimited.owner = exp;
        } else if (exp instanceof PitPropertyCallExp ) {
            this.setOwner(exp.source, exp);
            exp.__property.owner = exp;
        } else if (exp instanceof PitSelfExp) {
        } else if (exp instanceof PitVarCallExp) {
            exp.__variable.owner = exp;
        } else if (exp instanceof PitWhereExp) {
            exp.variable.owner = exp;
            exp.conditions.forEach(cond => {
                this.setOwner(cond, exp);
            })
        }
    }
}
