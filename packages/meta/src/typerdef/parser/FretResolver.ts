import type {
    FreMetaClassifier,
    FreMetaInstance,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaProperty,
    MetaElementReference
} from '../../languagedef/metalanguage/index.js';
import type {
    FreTyperElement,
    FretVarDecl,
    FretTypeConcept
} from '../metalanguage/index.js';
import {
    FretCreateExp,
    FretPropertyCallExp,
    FretVarCallExp,
    FretWhereExp,
    TyperDef
} from '../metalanguage/index.js';
import { Names } from "../../utils/on-lang/index.js";
import type { CheckRunner} from '../../utils/basic-dependencies/index.js';
import { ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { ReferenceResolver } from '../../languagedef/checking/ReferenceResolver.js';
import { isNullOrUndefined } from '../../utils/file-utils/index.js';

const LOGGER = new MetaLogger("FretResolver").mute();

export class FretResolver {
    static definition: TyperDef;
    // @ts-ignore Set during checking
    static language: FreMetaLanguage;

    static resolveClassifierReference(classifierRef: MetaElementReference<FreMetaClassifier> | undefined, runner: CheckRunner, language: FreMetaLanguage) {
        if (!!classifierRef) {
            let result: FreMetaClassifier | undefined;
            if (classifierRef.name === Names.FreType || classifierRef.name === "FreonType") {
                result = TyperDef.freonType;
            } else {
                // search the typeConcepts only, 'normal' classifiers will be found by ReferenceResolver
                const xx: FretTypeConcept | undefined = this.definition.typeConcepts.find((con) => con.name === classifierRef.name);
                if (!!xx) {
                    result = xx;
                }
            }
            if (!!result) {
                classifierRef.referred = result;
            } else {
                // if no typer property found then try to resolve it as 'normal' property
                ReferenceResolver.resolveClassifierReference(classifierRef, runner, language);
            }
        }
    }

    static resolveVariableReference(variableRef: MetaElementReference<FretVarDecl>, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in ReferenceResolver.resolvePropertyReference");
            return;
        }

        if (!!variableRef) {
            // find reference
            let myRef;
            if (variableRef.owner instanceof FretVarCallExp) {
                // find the only place in the typer definition where a variable can be declared: a FretWhereExp
                const whereExp: FretWhereExp | undefined = this.findSurroundingWhereExp(variableRef.owner);
                if (!isNullOrUndefined(whereExp) && whereExp?.variable.name === variableRef.name) {
                    myRef = whereExp.variable;
                }
            }

            // check the result
            runner.nestedCheck({
                check: !!myRef,
                error: `Cannot find variable '${variableRef.name}' ${ParseLocationUtil.location(variableRef)}.`,
                whenOk: () => {
                    // set the .referred value
                    variableRef.referred = myRef!;
                }
            });
        }
    }

    static resolvePropertyReference(propertyRef: MetaElementReference<FreMetaProperty> | undefined, context: FreMetaClassifier, runner: CheckRunner) {
        if (!!propertyRef) {
            // first search for a special typer property
            let nameSpace: FreMetaClassifier | undefined;
            let owner = propertyRef.owner;
            if (owner instanceof FretCreateExp) {
                nameSpace = owner.type;
            } else if (owner instanceof FretPropertyCallExp) {
                nameSpace = owner.source.returnType;
            }
            const result = nameSpace?.allProperties().find((prop) => prop.name === propertyRef.name);
            if (!!result) {
                propertyRef.referred = result;
            } else {
                // if no typer property found then try to resolve it as 'normal' property
                ReferenceResolver.resolvePropertyReference(propertyRef, context, runner);
            }
        }
    }

    static resolveInstanceReference(myInstanceRef: MetaElementReference<FreMetaInstance>, context: FreMetaLimitedConcept, runner: CheckRunner) {
        ReferenceResolver.resolveInstanceReference(myInstanceRef, context, runner);
    }

    private static findSurroundingWhereExp(owner: FreTyperElement): FretWhereExp | undefined {
        if (owner instanceof FretWhereExp) {
            return owner;
        } else {
            if (owner.owner) {
                return this.findSurroundingWhereExp(owner.owner);
            } else {
                return undefined;
            }
        }
    }
}
