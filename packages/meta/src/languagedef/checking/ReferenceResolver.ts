import type {
    FreMetaClassifier,
    MetaElementReference,
    FreMetaLanguage, FreMetaProperty, FreMetaLimitedConcept, FreMetaInstance
} from '../metalanguage/index.js';
import type { CheckRunner} from '../../utils/basic-dependencies/index.js';
import { ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { MetaLogger } from '../../utils/no-dependencies/index.js';

const LOGGER = new MetaLogger("ReferenceResolver").mute();

export class ReferenceResolver {

    static resolveClassifierReference(classifierRef: MetaElementReference<FreMetaClassifier> | undefined, runner: CheckRunner, language: FreMetaLanguage) {
        if (!runner) {
            LOGGER.log("NO RUNNER in ReferenceResolver.resolveClassifierReference");
            return;
        }

        if (!!classifierRef) {
            runner.nestedCheck({
                check: !!classifierRef && classifierRef.name !== undefined,
                error: `Classifier reference should have a name ${ParseLocationUtil.location(classifierRef)}.`,
                whenOk: () => {
                    if (!classifierRef.referred) {
                        // set reference
                        if (!!language) {
                            language.classifiers().forEach(classifier => {
                                if (classifier.name === classifierRef.name) {
                                    classifierRef.referred = classifier;
                                }
                            });
                        }
                        // if no result, give error message
                        runner.simpleCheck(
                            classifierRef.referred !== undefined,
                            `Cannot find classifier '${classifierRef.name}' ${ParseLocationUtil.location(classifierRef)}.`,
                        );
                    }
                },
            });
        }
    }

    static resolvePropertyReference(propertyRef: MetaElementReference<FreMetaProperty> | undefined, context: FreMetaClassifier, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in ReferenceResolver.resolvePropertyReference");
            return;
        }

        if (!!propertyRef) {
            // find reference
            const myProp: FreMetaProperty | undefined = context
              .allProperties()
              .find((prop) => prop.name === propertyRef.name);

            // check the result
            runner.nestedCheck({
                check: !!myProp,
                error: `Cannot find property '${propertyRef.name}' in classifier '${context.name}' ${ParseLocationUtil.location(propertyRef)}.`,
                whenOk: () => {
                    // set the 'property' attribute of the projection
                    propertyRef.referred = myProp!;
                }
            });
        }
    }

    static resolveInstanceReference(myInstanceRef: MetaElementReference<FreMetaInstance>, context: FreMetaLimitedConcept, runner: CheckRunner) {
        if (!!myInstanceRef) {
            const foundInstance = context.instances.find(
              (l) => l.name === myInstanceRef.name,
            );
            // check the result
            runner.nestedCheck({
                check: !!foundInstance,
                error: `Cannot find instance '${myInstanceRef.name}' of limited concept '${context.name}' ${ParseLocationUtil.location(myInstanceRef)}.`,
                whenOk: () => {
                    myInstanceRef.referred = foundInstance!;
                }
            });
        }
    }
}
