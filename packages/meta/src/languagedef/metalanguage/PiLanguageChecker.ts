import { Checker } from "../../utils";
import {
    PiLangConceptProperty,
    PiLanguageUnit,
    PiLangBinaryExpressionConcept,
    PiLangExpressionConcept,
    PiLangPrimitiveProperty,
    PiLangClass,
    PiLangEnumeration,
    PiLangUnion,
    PiLangEnumProperty,
    PiLangInterface
} from "./PiLanguage";
import {
    PiLangClassReference,
    PiLangConceptReference,
    PiLangEnumerationReference,
    PiLangInterfaceReference,
    PiLangUnionReference
} from "./PiLangReferences";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiParseClass } from "../parser/PiParseLanguage";

const LOGGER = new PiLogger("PiLanguageChecker").mute();

// This class first resolves the references that could not be parsed in another manner.
// Secondly, it checks all other constraints on the language metamodel
export class PiLanguageChecker extends Checker<PiLanguageUnit> {
    foundRoot = false;

    public check(language: PiLanguageUnit): void {
        LOGGER.log("Checking language '" + language.name + "'");
        this.simpleCheck(!!language.name,
            `Language should have a name [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);

        this.language = language;
        // first resolve the PiParseClasses, and replace the parse classes by the resolved classes
        language.classes = this.resolvePiParseClass();
        
        // ensure all references to the language are set
        this.setLanguageReferences(language);    

        // now check the whole language
        // TODO check that all concepts have unique names
        language.classes.forEach(concept => this.checkClass(concept));
        language.enumerations.forEach(concept => this.checkEnumeration(concept));
        language.unions.forEach(concept => this.checkUnion(concept));
        language.interfaces.forEach(concept => this.checkInterface(concept));

        this.simpleCheck(!!language.classes.find(c => c.isRoot),
            `There should be a root concept in your language [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);
        this.simpleCheck(!(!!language.classes.find(c => c instanceof PiParseClass)),
            `Error in checker: there are unresolved parse classes [line: ${language.location?.start.line}, column: ${language.location?.start.column}].`);
    }

    private setLanguageReferences(language: PiLanguageUnit) {
        language.classes.forEach(concept => {
            concept.language = language;
            concept.references.forEach(ref => ref.type.language = language);
            concept.parts.forEach(part => part.type.language = language);
            concept.enumProperties.forEach(en => en.type.language = language);
            if (!!concept.base) {
                concept.base.language = language;
            }
            for (let i of concept.interfaces) {
                i.language = language;
            }
        });
        language.enumerations.forEach(enumeration => {
            enumeration.language = language;
        });
        language.unions.forEach(union => {
            union.language = language;
            union.members.forEach(mem => mem.language = language);
        });
        language.interfaces.forEach(concept => {
            concept.language = language;
            concept.references.forEach(ref => ref.type.language = language);
            concept.parts.forEach(part => part.type.language = language);
            concept.enumProperties.forEach(en => en.type.language = language);
            if (!!concept.base) {
                concept.base.language = language;
            }
        });
    }

    private resolvePiParseClass() : PiLangClass[] {
        let newList: PiLangClass[] = [];
        this.language.classes.forEach(concept => {
            if (concept instanceof PiParseClass) { // should always be the case
                if (concept.isBinary || this.baseIsBinary(concept)) { // found binary expression  
                    // LOGGER.log("found binary expression " + concept.name);
                    let result = new PiLangBinaryExpressionConcept();
                    // copy properties
                    // result.symbol = concept.symbol;
                    result.priority = concept.priority;
                    result._isExpressionPlaceHolder = concept._isExpressionPlaceHolder;
                    this.copyCommonProperties(result, concept);
                    newList.push(result);
                }
                else if (concept.isExpression || this.baseIsExpression(concept)) { // found expression
                    // LOGGER.log("found expression " + concept.name);
                    let result = new PiLangExpressionConcept();
                    // copy properties
                    result._isExpressionPlaceHolder = concept._isExpressionPlaceHolder;
                    this.copyCommonProperties(result, concept);
                    newList.push(result);
                }
                else { // found class
                    // LOGGER.log("found class " + concept.name);
                    let result = new PiLangClass();
                    // copy properties
                    this.copyCommonProperties(result, concept);
                    newList.push(result);
                }
            }
        });
        return newList;
    }

    private copyCommonProperties(result: PiLangClass, concept: PiParseClass) {
        result.isRoot = concept.isRoot;
        result.isAbstract = concept.isAbstract;
        result.name = concept.name;
        result.base = concept.base;
        result.interfaces = concept.interfaces;
        result.parts = concept.parts;
        result.references = concept.references;
        result.trigger = concept.trigger;
        result.primProperties = concept.primProperties;
        result.enumProperties = concept.enumProperties;

        // set owning class
        result.parts.forEach(part => part.owningConcept = result);
        result.primProperties.forEach(prop => prop.owningConcept = result);
        result.enumProperties.forEach(prop => prop.owningConcept = result);
        result.references.forEach(ref => ref.owningConcept = result);
    }

    private baseIsExpression(piClass: PiParseClass): boolean {
        if(!!piClass.base) {
            let baseConcept = this.language.classes.find(con => con.name === piClass.base.name);
            if( baseConcept instanceof PiParseClass ) { // should always be the case
                if ( baseConcept.isExpression ) return true;
                return this.baseIsExpression(baseConcept);
            }
        }
        return false;
    }

    private baseIsBinary(piClass: PiParseClass): boolean {
        if(!!piClass.base) {
            let baseConcept = this.language.classes.find(con => con.name === piClass.base.name);
            if( baseConcept instanceof PiParseClass ) { // should always be the case
                if ( baseConcept.isBinary ) return true;
                return this.baseIsBinary(baseConcept);
            }
        }
        return false;
    }

    // the remaining functions are checking functions, only the concept references are morfed into
    private checkUnion(union: PiLangUnion): void {
        let newMembers: PiLangConceptReference[] = [];
        union.members.forEach (mem => {
            this.checkConceptReference(mem);
            if (!!mem.referedElement()) { // error message taken care of by checkConceptReference
                this.nestedCheck({
                    check: (mem.referedElement() instanceof PiLangClass || mem.referedElement() instanceof PiLangEnumeration),
                    error:  `A member of a union concept '${mem.name}' must be a class or enumeration concept `+
                            `[line: ${mem.location?.start.line}, column: ${mem.location?.start.column}].`,
                    whenOk: () => {
                        newMembers.push(this.morfConceptReferenceIntoSubClass(mem));
                    }
                });
            }
        });
        union.members = newMembers;
    }

    private checkEnumeration(enumConcept: PiLangEnumeration) {
        // TODO check that all literal have unique names
        this.simpleCheck(enumConcept.parts.length == 0 || enumConcept.references.length == 0 
            || enumConcept.enumProperties.length == 0 || enumConcept.primProperties.length == 0, 
            `Enumeration '${enumConcept.name}' may not have  properties [line: ${enumConcept.location?.start.line}, column: ${enumConcept.location?.start.column}].`);
    }


    private checkClass(piClass: PiLangClass): void {
        LOGGER.log("Checking class '" + piClass.name + "'");
        // TODO check that all properties have unique names
        this.simpleCheck(!!piClass.name, `Concept should have a name [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

        if( piClass.isRoot ) {
            this.simpleCheck(!this.foundRoot,
                `There may be only one root class in the language definition [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
            this.foundRoot = true;
        }

        if(!!piClass.base) {
            this.checkConceptReference(piClass.base);
            if (!!piClass.base.referedElement()) { // error message taken care of by checkConceptReference
                this.nestedCheck({
                    check: (piClass.base.referedElement() instanceof PiLangClass),
                    error:  `Base concept '${piClass.base.name}' must be a class concept `+
                        `[line: ${piClass.base.location?.start.line}, column: ${piClass.base.location?.start.column}].`,
                    whenOk: () => {
                        piClass.base = this.morfConceptReferenceIntoSubClass(piClass.base) as PiLangClassReference;
                    }
                });
            }
        }

        let newInterfaces: PiLangInterfaceReference[] = [];
        for (let intf of piClass.interfaces) {
            this.checkConceptReference(intf);
            if (!!intf.referedElement()) { // error message taken care of by checkConceptReference
                this.nestedCheck({
                    check: (intf.referedElement() instanceof PiLangInterface),
                    error:  `'${intf.name}' is not an interface concept `+
                        `[line: ${intf.location?.start.line}, column: ${intf.location?.start.column}].`,
                    whenOk: () => {
                        newInterfaces.push(this.morfConceptReferenceIntoSubClass(intf) as PiLangInterfaceReference);
                    }
                });
            }
        }
        piClass.interfaces = newInterfaces;

        piClass.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piClass.enumProperties.forEach(prop => this.checkEnumProperty(prop));
        piClass.parts.forEach(part => this.checkConceptProperty(part));
        piClass.references.forEach(ref => this.checkConceptProperty(ref));

        if (piClass.binaryExpression() && !(piClass.isAbstract)) {
            const binExpConcept = piClass as PiLangBinaryExpressionConcept;
            // this.simpleCheck(binExpConcept.getSymbol() !== "undefined", `Concept ${piClass.name} should have a symbol`);
            this.simpleCheck(binExpConcept.getPriority() !== -1,
                `Concept ${piClass.name} should have a priority [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

            const left = piClass.allParts().find(part => part.name === "left");
            this.simpleCheck(!!left,
                `Concept ${piClass.name} should have a left part, because it is a binary expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
            this.simpleCheck(!!left && left.type.referedElement() instanceof PiLangExpressionConcept,
                `Concept ${piClass.name}.left should be an expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);

            const right = piClass.allParts().find(part => part.name === "right");
            this.simpleCheck(!!right,
                `Concept ${piClass.name} should have a right part, because it is a binary expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
            this.simpleCheck(!!right && right.type.referedElement() instanceof PiLangExpressionConcept,
                `Concept ${piClass.name}.right should be an expression [line: ${piClass.location?.start.line}, column: ${piClass.location?.start.column}].`);
        }
    }

    checkEnumProperty(prop: PiLangEnumProperty) {
        LOGGER.log(`Checking enum property '${prop.name}' [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}]`);
        // this.simpleCheck(prop.owningConcept !== null,
        //     `Property '${prop.name}' should belong to a concept [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}].`);
        this.nestedCheck(
            {
                check: !!prop.type,
                error: `Property '${prop.name}' should have a type [line: ${prop.location?.start.line}, column: ${prop.location?.start.column}].`,
                whenOk: () => {
                    this.checkConceptReference(prop.type);
                    if (!!prop.type.referedElement()){ // error message taken care of by checkConceptReference
                        this.nestedCheck({
                            check: prop.type.referedElement() instanceof PiLangEnumeration,
                            error:  `Enum property '${prop.name}' should have an enumeration concept as type `+
                                    `[line: ${prop.type.location?.start.line}, column: ${prop.type.location?.start.column}]. (Maybe use prefix 'part' or 'reference'?)`,
                            whenOk: () => {
                                prop.type = this.morfConceptReferenceIntoSubClass(prop.type) as PiLangEnumerationReference;
                            }
                        });
                    }
                }
            });
    }

    checkConceptProperty(element: PiLangConceptProperty): void {
        LOGGER.log("Checking concept property '" + element.name + "'");
        this.nestedCheck(
            {
                check: !!element.type,
                error: `Element '${element.name}' should have a type [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                whenOk: () => {
                    this.checkConceptReference(element.type);
                    if (!!element.type.referedElement()) { // error message taken care of by checkConceptReference
                        this.nestedCheck({
                            check: !(element.type.referedElement() instanceof PiLangEnumeration),
                            error:  `Part or reference property '${element.name}' may not have an enumeration concept as type `+
                                    `[line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                            whenOk: () => {
                                element.type = this.morfConceptReferenceIntoSubClass(element.type);
                            }
                        });
                    }
                }
            });
    }

    checkPrimitiveProperty(element: PiLangPrimitiveProperty): void {
        LOGGER.log("Checking primitive property '" + element.name + "'");
        this.simpleCheck(!!element.name,
            `Property should have a name [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`);
        this.nestedCheck(
            {
                check: !!element.primType,
                error: `Property '${element.name}' should have a type [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`,
                whenOk: () => this.checkPrimitiveType(element.primType, element)
            });
    }

    /**
     * After this method is called, 'morfConceptReferenceIntoSubClass' should be called to change the reference into the correct subclass
     * of PiLangConceptReference
     */
    checkConceptReference(reference: PiLangConceptReference): void {
        LOGGER.log("Checking concept reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept reference should have a name [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`,
                whenOk: () => this.nestedCheck(
                    {
                        check: reference.referedElement() !== undefined,
                        error: `Reference to ${reference.name} cannot be resolved [line: ${reference.location?.start.line}, column: ${reference.location?.start.column}].`
                    })
            })
    }

    checkPrimitiveType(type: string, element: PiLangPrimitiveProperty) {
        LOGGER.log("Checking primitive type '" + type + "'");
        this.simpleCheck((type === "string" || type === "boolean" || type === "number"),
            `Primitive property '${element.name}' should have a primitive type (string, boolean, or number) [line: ${element.location?.start.line}, column: ${element.location?.start.column}].`
        );
    }

    checkInterface(piInterface: PiLangInterface) {
        this.simpleCheck(!!piInterface.name, `Concept should have a name [line: ${piInterface.location?.start.line}, column: ${piInterface.location?.start.column}].`);
        if(!!piInterface.base) {
            this.checkConceptReference(piInterface.base);
            if (!!piInterface.base.referedElement()) { // error message taken care of by checkConceptReference
                this.nestedCheck({
                    check: (piInterface.base.referedElement() instanceof PiLangInterface),
                    error:  `Base concept '${piInterface.base.name}' must be an interface concept `+
                        `[line: ${piInterface.base.location?.start.line}, column: ${piInterface.base.location?.start.column}].`,
                    whenOk: () => {
                        piInterface.base = this.morfConceptReferenceIntoSubClass(piInterface.base) as PiLangClassReference;
                    }
                });
            }
        }

        piInterface.primProperties.forEach(prop => this.checkPrimitiveProperty(prop));
        piInterface.enumProperties.forEach(prop => this.checkEnumProperty(prop));
        piInterface.parts.forEach(part => this.checkConceptProperty(part));
        piInterface.references.forEach(ref => this.checkConceptProperty(ref));
    }

    /**
     * This method changes the input into one of its subclasses based on its referedElement.
     * The return type is PiLangConceptReference, but what is actually returned, is one of its subclasses.
     */
    private morfConceptReferenceIntoSubClass(ref: PiLangConceptReference): PiLangConceptReference {
        let result : PiLangConceptReference = ref;
        if (ref.referedElement() instanceof PiLangClass)  {
            result = new PiLangClassReference();
        } else if (ref.referedElement() instanceof PiLangInterface) {
            result = new PiLangInterfaceReference();
        } else if (ref.referedElement() instanceof PiLangEnumeration) {
            result = new PiLangEnumerationReference();
        } else if (ref.referedElement() instanceof PiLangUnion) {
            result = new PiLangUnionReference();
        }
        if (result !== ref) {
            result.language = ref.language;
            result.location = ref.location;
            result.name = ref.name;
        }
        return result;
    }


}

