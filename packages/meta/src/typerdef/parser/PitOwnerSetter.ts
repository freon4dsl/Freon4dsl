import {
    PitAnytypeExp,
    PitExp,
    PitFunctionCallExp,
    PitLimitedInstanceExp, PitProperty,
    PitPropertyCallExp, PitSelfExp,
    PitWhereExp,
    PiTyperDef, PiTyperElement
} from "../metalanguage";
import { PitBinaryExp, PitCreateExp, PitVarCallExp } from "../metalanguage/expressions";

/**
 * This class sets the 'owner' property of all nodes in a parsed PiTyperDef.
 * The 'owner' is the node that contains the node in question, similar to
 * 'container' in PiElement at the model level.
 */
export class PitOwnerSetter {
    static setNodeOwners(typeDef: PiTyperDef) {
        typeDef.typeConcepts.forEach(con => {
            con.properties.forEach(prop => {
                if (prop instanceof PitProperty) {
                    prop.owner = con;
                    prop.refType.owner = prop;
                }
            });
        });
        typeDef.classifierSpecs.forEach(spec => {
            spec.rules.forEach(rule => {
                this.setOwner(rule.exp, rule);
                rule.owner = spec;
            });
            spec.owner = typeDef;
            spec.__myClassifier.owner = spec;
        });
    }

    private static setOwner(exp: PitExp, owner: PiTyperElement) {
        exp.owner = owner;
        if (exp instanceof PitAnytypeExp ) {
        } else if (exp instanceof PitBinaryExp) {
            this.setOwner(exp.left, exp);
            this.setOwner(exp.right, exp);
        } else if (exp instanceof PitCreateExp) {
            exp.__type.owner = exp;
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
            exp.variable.__type.owner = exp.variable;
            exp.conditions.forEach(cond => {
                this.setOwner(cond, exp);
            })
        }
    }
}
