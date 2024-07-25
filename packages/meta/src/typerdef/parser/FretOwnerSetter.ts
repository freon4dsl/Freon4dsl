import {
    FretExp,
    FretFunctionCallExp,
    FretLimitedInstanceExp, FretProperty,
    FretPropertyCallExp, FretWhereExp,
    TyperDef, FreTyperElement
} from "../metalanguage/index.js";
import { FretBinaryExp, FretCreateExp, FretVarCallExp } from "../metalanguage/expressions/index.js";

/**
 * This class sets the 'owner' property of all nodes in a parsed TyperDef.
 * The 'owner' is the node that contains the node in question, similar to
 * 'container' in FreElement at the model level.
 */
export class FretOwnerSetter {
    static setNodeOwners(typeDef: TyperDef) {
        typeDef.typeConcepts.forEach(con => {
            con.properties.forEach(prop => {
                if (prop instanceof FretProperty) {
                    prop.owner = con;
                    prop.typeReference.owner = prop;
                }
            });
        });
        typeDef.classifierSpecs.forEach(spec => {
            spec.rules.forEach(rule => {
                this.setOwner(rule.exp, rule);
                rule.owner = spec;
            });
            spec.owner = typeDef;
            spec.$myClassifier.owner = spec;
        });
    }

    private static setOwner(exp: FretExp, owner: FreTyperElement) {
        exp.owner = owner;
        // if ((exp instanceof FretAnytypeExp )) {
        // } else
        if (exp instanceof FretBinaryExp) {
            this.setOwner(exp.left, exp);
            this.setOwner(exp.right, exp);
        } else if (exp instanceof FretCreateExp) {
            exp.$type.owner = exp;
            exp.propertyDefs.forEach(propDef => {
                this.setOwner(propDef.value, propDef);
                propDef.$property.owner = exp;
                propDef.owner = exp;
            });
        } else if (exp instanceof FretFunctionCallExp) {
            exp.actualParameters.forEach(par => {
               this.setOwner(par, exp);
            });
        } else if (exp instanceof FretLimitedInstanceExp) {
            exp.$myInstance.owner = exp;
            if (!!exp.$myLimited) {
                exp.$myLimited.owner = exp;
            }
        } else if (exp instanceof FretPropertyCallExp ) {
            this.setOwner(exp.source, exp);
            exp.$property.owner = exp;
        // } else if (exp instanceof FretSelfExp) {
        } else if (exp instanceof FretVarCallExp) {
            exp.$variable.owner = exp;
        } else if (exp instanceof FretWhereExp) {
            exp.variable.owner = exp;
            exp.variable.$type.owner = exp.variable;
            exp.conditions.forEach(cond => {
                this.setOwner(cond, exp);
            });
        }
    }
}
