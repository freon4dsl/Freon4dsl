import {
    PiPrimitiveProperty,
    PiConceptProperty,
    PiLanguage,
    PiInterface,
    PiInstanceProperty,
    PiInstance,
    PiExpressionConcept,
    PiBinaryExpressionConcept,
    PiLimitedConcept, PiConcept, PiProperty, PiClassifier, PiPrimitiveValue, PiPrimitiveType, PiModelDescription, PiUnitDescription
} from "../metalanguage/PiLanguage";
import { PiElementReference } from "../metalanguage/PiElementReference";
import { Checker } from "../../utils";

// Functions used to create instances of the language classes from the parsed data objects.
let currentFileName: string = "SOME_FILENAME";

export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

let nonFatalParseErrors: string[] = [];

export function getNonFatalParseErrors(): string[] {
    return nonFatalParseErrors;
}

export function cleanNonFatalParseErrors() {
    nonFatalParseErrors = [];
}

export function createLanguage(data: Partial<PiLanguage>): PiLanguage {
    // console.log("createLanguage " + data.name);
    const result = new PiLanguage();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.concepts) {
        let hasModel: boolean = false;
        for (const con of data.concepts) {
            if (con instanceof PiInterface) {
                result.interfaces.push(con);
            } else if (con instanceof PiModelDescription) {
                if (hasModel) {
                    let location: string = `[no location]`;
                    if (!!con.location) {
                        location = Checker.locationPlus(currentFileName, con.location);
                    }
                    nonFatalParseErrors.push(`There may be only one model in the language definition ${location}.`)
                } else {
                    hasModel = true;
                    result.modelConcept = con;
                }
            } else if (con instanceof PiUnitDescription) {
                result.units.push(con);
            } else {
                result.concepts.push(con);
            }
            // the next statement is not needed after multi-file merge, but remains for the single-file commands like 'meta-it'
            con.language = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createModel(data: Partial<PiModelDescription>): PiModelDescription {
    // console.log("createModel " + data.name);
    const result = new PiModelDescription();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.properties) {
        for (const prop of data.properties) {
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createUnit(data: Partial<PiUnitDescription>): PiUnitDescription {
    // console.log("createUnit " + data.name);
    const result = new PiUnitDescription();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.properties) {
        for (const prop of data.properties) {
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
        }
    }
    if (!!data.fileExtension) {
        result.fileExtension = data.fileExtension;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createConcept(data: Partial<PiConcept>): PiConcept {
    // console.log("createConceptOrUnit " + data.name);
    const result = new PiConcept();
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createLimitedConcept(data: Partial<PiLimitedConcept>): PiLimitedConcept {
    // console.log("createLimitedConcept " + data.name);
    const result = new PiLimitedConcept();
    result.isAbstract = !!data.isAbstract;
    if (!!data.instances) {
        result.instances = data.instances;
        for (const inst of result.instances) {
            inst.concept = PiElementReference.create<PiLimitedConcept>(result, "PiLimitedConcept");
            inst.concept.owner = inst;
        }
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createInterface(data: Partial<PiInterface>): PiInterface {
    // console.log("createInterface " + data.name);
    const result = new PiInterface();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.base) {
        result.base = data.base;
        for (const intf of result.base) {
            intf.owner = result;
        }
    }
    if (!!data.properties) {
        for (const prop of data.properties) {
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

function createCommonConceptProps(data: Partial<PiExpressionConcept>, result: PiConcept) {
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.base) {
        result.base = data.base;
        result.base.owner = result;
    }
    if (!!data.interfaces) {
        result.interfaces = data.interfaces;
        for (const intf of result.interfaces) {
            intf.owner = result;
        }
    }
    if (!!data.properties) {
        for (const prop of data.properties) {
            // if (result.name === "Type2"){
            //     console.log("parsed: " + data.properties.map(p => p.name).join(", "))
            // }
            // TODO check whether this distinction can be removed
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
}

export function createBinaryExpressionConcept(data: Partial<PiBinaryExpressionConcept>): PiBinaryExpressionConcept {
    // console.log("createBinaryExpressionConcept " + data.name);
    const result = new PiBinaryExpressionConcept();
    result.isAbstract = !!data.isAbstract;
    if ( !!data.priority ) {
        result.priority = data.priority;
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createExpressionConcept(data: Partial<PiExpressionConcept>): PiExpressionConcept {
    // console.log("createExpressionConcept " + data.name);
    const result = new PiExpressionConcept();
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

function createCommonPropertyAttrs(data: Partial<PiProperty>, result: PiProperty) {
    if (!!data.name) {
        result.name = data.name;
    }
    result.isOptional = !!data.isOptional;
    result.isPublic = !!data.isPublic;
    result.isList = !!data.isList;
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
}

// we parse all props as primitive properties because they can have an extra attribute: 'initialValue'
export function createPartOrPrimProperty(data: Partial<PiPrimitiveProperty>): PiProperty {
    // console.log("createPartOrPrimProperty " + data.name + " "+ data.type + " "+ data.typeName);
    let result: PiProperty;
    // In the following we ignore data.initialValue for Part Properties (i.e. props where the type is a Concept).
    // But we do add an error message to the list of non-fatal parse errors.
    // This list of errors is added to the list of checking errors in the parse functions in PiParser.
    if (!!data.type) {
        // NOTE that the following check can NOT be '.type.referred === PiPrimitiveType.identifier' etc.
        // '.type.referred' is determine by the scoper, which does not function when not all concepts are known AND
        // the language attribute of the concepts has been set. The latter is done in 'createLanguage', which is called
        // after this function is called!!
        if (data.type.name === "string" || data.type.name === "boolean" || data.type.name === "number" || data.type.name === "identifier") {
            const primitiveProperty = new PiPrimitiveProperty();
            // in the following statement we cannot use "!!data.initialValue" because it could be a boolean
            // we are not interested in its value, only whether it is present
            if (data.initialValue !== null && data.initialValue !== undefined) {
                if (Array.isArray(data.initialValue)) {
                    primitiveProperty.initialValueList = data.initialValue;
                } else {
                    primitiveProperty.initialValue = data.initialValue;
                }
            }
            result = primitiveProperty;
        } else {
            const conceptProperty = new PiConceptProperty();
            // in the following statement we cannot use "!!data.initialValue" because it could be a boolean
            // we are not interested in its value, only whether it is present
            if (data.initialValue !== null && data.initialValue !== undefined) {
                nonFatalParseErrors.push(`A non-primitive property may not have an initial value ${Checker.locationPlus(currentFileName, data.location)}.`);
            }
            result = conceptProperty;
        }
        result.type = data.type;
        result.type.owner = result;
    }
    result.isPart = true;
    createCommonPropertyAttrs(data, result);
    return result;
}

export function createReferenceProperty(data: Partial<PiConceptProperty>): PiConceptProperty {
    // console.log("createReference " + data.name);
    const result = new PiConceptProperty();
    result.isPart = false;
    createCommonPropertyAttrs(data, result);
    if (!!data.type) {
        result.type = data.type;
        result.type.owner = result;
    }
    return result;
}

export function createClassifierReference(data: Partial<PiElementReference<PiClassifier>>): PiElementReference<PiClassifier> {
    // console.log("createClassifierReference " + data.name);
    let result: PiElementReference<PiClassifier> = null;
    if (!!data.name) {
        const type: string = data.name;
        if (type === "string") {
            result = PiElementReference.create<PiPrimitiveType>(PiPrimitiveType.string, "PiPrimitiveType");
        } else if (type === "boolean") {
            result = PiElementReference.create<PiPrimitiveType>(PiPrimitiveType.boolean, "PiPrimitiveType");
        } else if (type === "number") {
            result = PiElementReference.create<PiPrimitiveType>(PiPrimitiveType.number, "PiPrimitiveType");
        } else if (type === "identifier") {
            result = PiElementReference.create<PiPrimitiveType>(PiPrimitiveType.identifier, "PiPrimitiveType");
        } else {
            result = PiElementReference.create<PiClassifier>(data.name, "PiClassifier");
        }
    }
    if (!!result && !!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }

    return result;
}

export function createInterfaceReference(data: Partial<PiElementReference<PiInterface>>): PiElementReference<PiInterface> {
    // console.log("createInterfaceReference " + data.name);
    const result = PiElementReference.create<PiInterface>(data.name, "PiInterface");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createInstance(data: Partial<PiInstance>): PiInstance {
    const result = new PiInstance();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.props) {
        result.props.push(...data.props);
        for (const p of result.props) {
            p.owningInstance = PiElementReference.create<PiInstance>(result, "PiInstance");
        }
    }
    // if the user has not provided a value for the 'name' property,
    // or the instance was defined using the shorthand that simulates enumeration
    // create a value for the 'name' property based on 'data.name'
    if (!(!!data.props) || !data.props.some(prop => prop.name === "name")) {
        const prop = new PiInstanceProperty();
        prop.name = "name";
        prop.value = data.name;
        prop.owningInstance = PiElementReference.create<PiInstance>(result, "PiInstance");
        prop.location = data.location;
        result.props.push(prop);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createPropDef(data: Partial<PiInstanceProperty>): PiInstanceProperty {
    const result = new PiInstanceProperty();
    if (!!data.name) {
        result.name = data.name;
    }
    // in the following statement we cannot use "!!data.value" because it could be a boolean
    // we are not interested in its value, only whether it is present
    if (data.value !== null && data.value !== undefined) {
        if (Array.isArray(data.value)) {
            result.valueList.push(...data.value);
        } else {
            result.value = data.value;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}
