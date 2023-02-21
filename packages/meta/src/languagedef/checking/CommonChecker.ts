import {
    FreClassifier,
    FreConcept,
    MetaElementReference, FreInterface,
    FrePrimitiveProperty,
    FrePrimitiveType,
    FrePrimitiveValue,
    FreProperty
} from "../metalanguage";
import { CheckRunner, LangUtil, MetaLogger, Names, ParseLocationUtil } from "../../utils";

const LOGGER = new MetaLogger("CommonChecker").mute();

export class CommonChecker {

    public static checkClassifierReference(reference: MetaElementReference<FreClassifier>, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in CommonChecker.checkClassifierReference");
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

    public static checkOrCreateNameProperty(classifier: FreClassifier, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in CommonChecker.checkOrCreateNameProperty");
            return;
        }
        let nameProperty = classifier.allPrimProperties().find(p => p.name === "name");
        // if 'name' property is not present, create it.
        if (!nameProperty) {
            nameProperty = new FrePrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.type = FrePrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = true;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = classifier;
            classifier.primProperties.push(nameProperty);
        } else {
            runner.simpleCheck(nameProperty.type === FrePrimitiveType.identifier,
                `The 'name' property of '${classifier.name}' should be of type 'identifier' ${ParseLocationUtil.location(classifier)}.`);
        }
    }

    public static checkUniqueNameOfClassifier(names: string[], classifier: FreClassifier, isUnit: boolean, runner: CheckRunner) {
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
    public static checkValueToType(value: FrePrimitiveValue, type: FrePrimitiveType): boolean {
        // LOGGER.log("checkValueToType: " + value + ", " + type + ", typeof " + typeof value);
        if (type === FrePrimitiveType.identifier && typeof value === "string") {
            return true;
        } else if (type === FrePrimitiveType.string && typeof value === "string") {
            return true;
        } else if (type === FrePrimitiveType.number && typeof value === "number") {
            return true;
        } else if (type === FrePrimitiveType.boolean && typeof value === "boolean") {
            return true;
        }
        return false;
    }

    public static makeCopyOfProp(property: FreProperty, classifier: FreConcept): FreProperty {
        let copy: FreProperty = new FreProperty();
        if (property instanceof FrePrimitiveProperty) {
            copy = new FrePrimitiveProperty();
        }
        copy.name = property.name;
        copy.isPublic = property.isPublic;
        copy.isOptional = property.isOptional;
        copy.isList = property.isList;
        copy.isPart = property.isPart;
        copy.implementedInBase = false; // false because the original property comes from an interface
        copy.type = property.type;
        copy.owningClassifier = classifier;
        if (property instanceof FrePrimitiveProperty) {
            classifier.primProperties.push(copy as FrePrimitiveProperty);
        } else {
            classifier.properties.push(copy);
        }
        return copy;
    }
}
