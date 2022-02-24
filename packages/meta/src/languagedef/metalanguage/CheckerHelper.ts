import { PiClassifier, PiPrimitiveProperty, PiPrimitiveType } from "./PiLanguage";
import { PiElementReference } from "./PiElementReference";
import { PiLangAbstractChecker } from "./PiLangAbstractChecker";
import { Checker } from "../../utils";

export class CheckerHelper {
    public static checkOrCreateNameProperty(classifier: PiClassifier, checker: PiLangAbstractChecker) {
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
            checker.simpleCheck(nameProperty.type === PiPrimitiveType.identifier,
                `The 'name' property of '${classifier.name}' should be of type 'identifier' ${Checker.location(classifier)}.`);
        }
    }
}
