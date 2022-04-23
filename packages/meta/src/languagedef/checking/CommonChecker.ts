import {
    PiClassifier,
    PiConcept,
    PiElementReference, PiInterface,
    PiPrimitiveProperty,
    PiPrimitiveType,
    PiPrimitiveValue,
    PiProperty
} from "../metalanguage";
import { CheckRunner, LangUtil, Names, ParseLocationUtil } from "../../utils";

export class CommonChecker {

    // TODO change console.logs to LOGGER.logs
    public static checkClassifierReference(reference: PiElementReference<PiClassifier>, runner: CheckRunner) {
        if (!runner) {
            console.log("NO RUNNER in CommonChecker.checkClassifierReference");
            return;
        }

        runner.nestedCheck({
                check: reference.name !== undefined,
                error: `Classifier reference should have a name ${ParseLocationUtil.location(reference)}.`,
                whenOk: () => {
                    runner.nestedCheck(
                        {
                            check: reference.referred !== undefined,
                            error: `Reference to classifier '${reference.name}' cannot be resolved ${ParseLocationUtil.location(reference)}.`
                        });
                }
            });
    }

    public static checkOrCreateNameProperty(classifier: PiClassifier, runner: CheckRunner) {
        if (!runner) {
            console.log("NO RUNNER in CommonChecker.checkOrCreateNameProperty");
            return;
        }
        let nameProperty = classifier.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if (!nameProperty) {
            nameProperty = new PiPrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.type = PiPrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = true;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = classifier;
            classifier.primProperties.push(nameProperty);
        } else {
            runner.simpleCheck(nameProperty.type === PiPrimitiveType.identifier,
                `The 'name' property of '${classifier.name}' should be of type 'identifier' ${ParseLocationUtil.location(classifier)}.`);
        }
    }

    public static checkUniqueNameOfClassifier(names: string[], classifier: PiClassifier, isUnit: boolean, runner: CheckRunner) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(classifier.name)) {
            runner.simpleCheck(false,
                `${isUnit ? `Unit` : `Concept or interface`} with name '${classifier.name}' already exists ${ParseLocationUtil.location(classifier)}.`);
        } else {
            names.push(Names.startWithUpperCase(classifier.name));
            names.push(classifier.name);
        }
    }

    /**
     * returns true if the 'value' conforms to 'primType'
     * @param value
     * @param type
     */
    public static checkValueToType(value: PiPrimitiveValue, type: PiPrimitiveType): boolean {
        // LOGGER.log("checkValueToType: " + value + ", " + type + ", typeof " + typeof value);
        if (type === PiPrimitiveType.identifier && typeof value === "string") {
            return true;
        } else if (type === PiPrimitiveType.string && typeof value === "string") {
            return true;
        } else if (type === PiPrimitiveType.number  && typeof value === "number") {
            return true;
        } else if (type === PiPrimitiveType.boolean  && typeof value === "boolean") {
            return true;
        }
        return false;
    }

    public static makeCopyOfProp(property: PiProperty, classifier: PiConcept): PiProperty {
        let copy: PiProperty = new PiProperty();
        if (property instanceof PiPrimitiveProperty) {
            copy = new PiPrimitiveProperty();
        }
        copy.name = property.name;
        copy.isPublic = property.isPublic;
        copy.isOptional = property.isOptional;
        copy.isList = property.isList;
        copy.isPart = property.isPart;
        copy.implementedInBase = false; // false because the original property comes from an interface
        copy.type = property.type;
        copy.owningClassifier = classifier;
        if (property instanceof PiPrimitiveProperty) {
            classifier.primProperties.push(copy as PiPrimitiveProperty);
        } else {
            classifier.properties.push(copy);
        }
        return copy;
    }
}
