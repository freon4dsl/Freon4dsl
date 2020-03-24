import { Checker } from "../../utils/Checker";
import { PiLangConceptProperty, PiLanguageUnit, PiLangBinaryExpressionConcept, PiLangExpressionConcept, PiLangPrimitiveProperty, PiLangClass } from "./PiLanguage";
import { PiLangConceptReference } from "./PiLangReferences";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiLanguageChecker"); // .mute();

export class PiLanguageChecker extends Checker<PiLanguageUnit> {

    public check(language: PiLanguageUnit): void {
        LOGGER.log("Checking language '" + language.name + "'");
        this.nestedCheck(
            {
                check: !!language.name,
                error: "Language should have a name, it is empty"
            });
        language.classes.forEach(concept => this.checkClass(concept));
        // TODO: checkEnum, checkInterface, CheckUnion
    }

    checkClass(piClass: PiLangClass): void {
        LOGGER.log("Checking concept '" + piClass.name + "'");
        this.simpleCheck(!!piClass.name, "Concept should have a name, it is empty");
        if(!!piClass.base) {
            this.checkConceptReference(piClass.base);
        }

        piClass.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        // TODO add the following:
        // concept.enumProperties.forEach(prop => this.checkPiEnumProperty(prop));
        piClass.parts.forEach(part => this.checkConceptProperty(part));
        piClass.references.forEach(ref => this.checkConceptProperty(ref));

        if (piClass.binaryExpression() && !(piClass.isAbstract)) {
            const binExpConcept = piClass as PiLangBinaryExpressionConcept;
            this.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${piClass.name} should have a symbol`);
            this.simpleCheck(binExpConcept.getPriority() !== -1, `Concept ${piClass.name} should have a priority`);

            const left = piClass.allParts().find(part => part.name === "left");
            this.simpleCheck(!!left, `Concept ${piClass.name} should have a left part, because it is a binary expression`);
            this.simpleCheck(!!left && left.type.referedElement() instanceof PiLangExpressionConcept, `Concept ${piClass.name}.left should be an expression, but it isn't`);

            const right = piClass.allParts().find(part => part.name === "right");
            this.simpleCheck(!!right, `Concept ${piClass.name} should have a right part, because it is a binary expression`);
            this.simpleCheck(!!right && right.type.referedElement() instanceof PiLangExpressionConcept, `Concept ${piClass.name}.right should be an expression, but it isn't`);
        }
    }

    checkConceptProperty(element: PiLangConceptProperty): void {
        LOGGER.log("Checking concept property '" + element.name + "'");
        this.nestedCheck(
            {
                check: !!element.type,
                error: "Element should have a type",
                whenOk: () => this.checkConceptReference(element.type)
            });
    }

    checkPrimitiveProperty(element: PiLangPrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.simpleCheck(!!element.name, "Property should have a name, it is empty");
        this.nestedCheck(
            {
                check: !!element.primType,
                error: "Property '" + element.name + "' should have a type " + element.primType + " " + element.type,
                whenOk: () => this.checkPrimitiveType(element.primType)
            });
    }
    
     checkConceptReference(reference: PiLangConceptReference): void {
        LOGGER.log("Checking concept reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept, union, or interface reference should have a name, but doesn't`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.referedElement() !== undefined,
                        error: `Reference to ${reference.name} cannot be resolved as one of concept, union, or interface`
                    })
            })
    }

    checkPrimitiveType(type: string) {
        LOGGER.log("Checking primitive type '" + type + "'");
        //TODO implement this check
        // this.simpleCheck((type === "string" || type === "boolean" || type === "number"),
        //     "Primitive property should have a primitive type (string, boolean, or number)"
        // );
    }
}

