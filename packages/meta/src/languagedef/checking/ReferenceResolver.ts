import {
    FreMetaClassifier,
    MetaElementReference,
    FreMetaLanguage, FreMetaProperty
} from '../metalanguage/index.js';
import { CheckRunner, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import { MetaLogger } from '../../utils/no-dependencies/index.js';

const LOGGER = new MetaLogger("ReferenceResolver").mute();

export class ReferenceResolver {

    public static resolveClassifierReference(classifierRef: MetaElementReference<FreMetaClassifier> | undefined, runner: CheckRunner, language: FreMetaLanguage) {
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
                            `Reference to classifier '${classifierRef.name}' cannot be resolved ${ParseLocationUtil.location(classifierRef)}.`,
                        );
                    }
                },
            });
        }
    }


    // @ts-ignore
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
                error: `Reference to property '${propertyRef.name}' cannot be resolved in ${context.name} ${ParseLocationUtil.location(propertyRef)}.`,
                whenOk: () => {
                    // set the 'property' attribute of the projection
                    propertyRef.referred = myProp!;
                }
            });
        }
    }
}
