import {
    FreMetaClassifier,
    FreMetaConcept,
    MetaElementReference,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
    FreMetaPrimitiveValue,
    FreMetaProperty,
    FreMetaLimitedConcept,
    FreMetaEnumValue,
} from "../metalanguage/index.js";
import { CheckRunner, MetaLogger, Names, ParseLocationUtil } from "../../utils/index.js";
import { CommonSuperTypeUtil } from "./common-super/CommonSuperTypeUtil.js";

const LOGGER = new MetaLogger("CommonChecker").mute();

export class CommonChecker {
    public static checkClassifierReference(reference: MetaElementReference<FreMetaClassifier>, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in CommonChecker.checkClassifierReference");
            return;
        }

        runner.nestedCheck({
            check: reference.name !== undefined,
            error: `Classifier reference should have a name ${ParseLocationUtil.location(reference)}.`,
            whenOk: () => {
                runner.nestedCheck({
                    check: reference.referred !== undefined,
                    error: `Reference to classifier '${reference.name}' cannot be resolved ${ParseLocationUtil.location(reference)}.`,
                });
            },
        });
    }

    public static checkOrCreateNameProperty(classifier: FreMetaClassifier, runner: CheckRunner) {
        if (!runner) {
            LOGGER.log("NO RUNNER in CommonChecker.checkOrCreateNameProperty");
            return;
        }
        let nameProperty = classifier.allPrimProperties().find((p) => p.name === "name");
        // if 'name' property is not present, create it.
        if (!nameProperty) {
            nameProperty = new FreMetaPrimitiveProperty();
            nameProperty.name = "name";
            nameProperty.id = "TODO_set-correct-id";
            nameProperty.key = "TODO_set-correct-key";
            nameProperty.type = FreMetaPrimitiveType.identifier;
            nameProperty.isPart = true;
            nameProperty.isList = false;
            nameProperty.isOptional = false;
            nameProperty.isPublic = true;
            nameProperty.isStatic = false;
            nameProperty.owningClassifier = classifier;
            classifier.primProperties.push(nameProperty);
        } else {
            runner.simpleCheck(
                nameProperty.type === FreMetaPrimitiveType.identifier,
                `The 'name' property of '${classifier.name}' should be of type 'identifier' ${ParseLocationUtil.location(classifier)}.`,
            );
        }
    }

    public static checkUniqueNameOfClassifier(
        names: string[],
        classifier: FreMetaClassifier,
        isUnit: boolean,
        runner: CheckRunner,
    ) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(classifier.name)) {
            runner.simpleCheck(
                false,
                `${isUnit ? `Unit` : `Concept or interface`} with name '${classifier.name}' already exists ${ParseLocationUtil.location(classifier)}.`,
            );
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
    public static checkValueToType(value: FreMetaPrimitiveValue, type: FreMetaPrimitiveType): boolean {
        // LOGGER.log("checkValueToType: " + value + ", " + type + ", typeof " + typeof value);
        if (type === FreMetaPrimitiveType.identifier && typeof value === "string") {
            return true;
        } else if (type === FreMetaPrimitiveType.string && typeof value === "string") {
            return true;
        } else if (type === FreMetaPrimitiveType.number && typeof value === "number") {
            return true;
        } else if (type === FreMetaPrimitiveType.boolean && typeof value === "boolean") {
            return true;
        }
        return false;
    }

    public static primitiveValueToString(type: FreMetaPrimitiveValue): string {
        if (type instanceof FreMetaEnumValue) {
            return type.sourceName;
        } else {
            return typeof type;
        }
    }

    /**
     * returns true if the 'limited' conforms to 'primType'
     * @param value
     * @param type
     */
    public static checkLimitedType(sub: FreMetaLimitedConcept, superType: FreMetaLimitedConcept): boolean {
        return CommonSuperTypeUtil.getSupers(sub).includes(superType);
    }

    public static makeCopyOfProp(property: FreMetaProperty, classifier: FreMetaConcept): FreMetaProperty {
        let copy: FreMetaProperty = new FreMetaProperty();
        if (property instanceof FreMetaPrimitiveProperty) {
            copy = new FreMetaPrimitiveProperty();
        }
        copy.name = property.name;
        copy.isPublic = property.isPublic;
        copy.isOptional = property.isOptional;
        copy.isList = property.isList;
        copy.isPart = property.isPart;
        copy.implementedInBase = false; // false because the original property comes from an interface
        copy.type = property.type;
        copy.key = property.key;
        copy.id = property.id;
        copy.owningClassifier = property.owningClassifier;
        copy.owningClassifier = classifier;
        if (property instanceof FreMetaPrimitiveProperty) {
            classifier.primProperties.push(copy as FreMetaPrimitiveProperty);
        } else {
            classifier.properties.push(copy);
        }
        return copy;
    }
}
