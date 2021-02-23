import {
    PiPrimitiveProperty,
    PiConceptProperty,
    PiLanguage,
    PiInterface,
    PiPropertyInstance,
    PiInstance,
    PiExpressionConcept,
    PiBinaryExpressionConcept,
    PiLimitedConcept, PiConcept, PiProperty
} from "../metalanguage/PiLanguage";
import { PiElementReference } from "../metalanguage/PiElementReference";

// Functions used to create instances of the language classes from the parsed data objects.
let currentFileName: string = "SOME_FILENAME";

export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

export function createLanguage(data: Partial<PiLanguage>): PiLanguage {
    // console.log("createLanguage " + data.name);
    const result = new PiLanguage();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.concepts) {
        for (const con of data.concepts) {
            if (con instanceof PiInterface) {
                result.interfaces.push(con);
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

export function createConcept(data: Partial<PiConcept>): PiConcept {
    // console.log("createConcept " + data.name);
    const result = new PiConcept();
    result.isModel = !!data.isModel;
    result.isUnit = !!data.isUnit;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createLimitedConcept(data: Partial<PiLimitedConcept>): PiLimitedConcept {
    // console.log("createLimitedConcept " + data.name);
    const result = new PiLimitedConcept();
    if (!!data.instances) {
        result.instances = data.instances;
        for (const inst of result.instances) {
            inst.concept = PiElementReference.create<PiLimitedConcept>(result, "PiLimitedConcept");
            inst.concept.owner = inst;
        }
    }
    createCommonConceptProps(data, result);
    // if 'name' property is not present, create it.
    if ( !(!!result.base) && !result.primProperties.some(prop => prop.name === "name") ) {
        const nameProperty = new PiPrimitiveProperty();
        nameProperty.name = "name";
        nameProperty.primType = "string";
        nameProperty.isPart = true;
        nameProperty.isList = false;
        nameProperty.isOptional = false;
        nameProperty.isPublic = false;
        nameProperty.isStatic = false;
        nameProperty.owningConcept = result;
        result.primProperties.push(nameProperty);
    }
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
            prop.owningConcept = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    result.isPublic = !!data.isPublic;
    return result;
}

function createCommonConceptProps(data: Partial<PiExpressionConcept>, result: PiConcept) {
    if (!!data.name) {
        result.name = data.name;
    }
    result.isPublic = !!data.isPublic;
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
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningConcept = result;
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
    result.isPublic = !!data.isPublic;
    result.isModel = !!data.isModel;
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
    result.isPublic = !!data.isPublic;
    result.isModel = !!data.isModel;
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
    // TODO data.initialValue is ignored for Part and Reference Properties
    // they should at least result in an error message
}

export function createPrimitiveProperty(data: Partial<PiPrimitiveProperty>): PiPrimitiveProperty {
    // console.log("createPrimitiveProperty " + data.name);
    const result = new PiPrimitiveProperty();
    result.isPart = true;
    if (!!data.primType) {
        result.primType = data.primType;
    }
    // in the following statement we cannot use "!!data.initialValue" because it could be a boolean
    // we are not interested in its value, only whether it is present
    if (data.initialValue !== null && data.initialValue !== undefined) {
        if (Array.isArray(data.initialValue)) {
            result.initialValueList = data.initialValue;
        } else {
            result.initialValue = data.initialValue;
        }
    }
    createCommonPropertyAttrs(data, result);
    return result;
}

export function createPartProperty(data: Partial<PiConceptProperty>): PiConceptProperty {
    // console.log("createPartProperty " + data.name);
    const result = new PiConceptProperty();
    result.isPart = true;
    createCommonPropertyAttrs(data, result);
    if (!!data.type) {
        result.type = data.type;
        result.type.owner = result;
    }
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

export function createConceptReference(data: Partial<PiElementReference<PiConcept>>): PiElementReference<PiConcept> {
    // console.log("createClassifierReference " + data.name);
    const result = PiElementReference.createNamed<PiConcept>(data.name, "PiConcept");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierReference(data: Partial<PiElementReference<PiConcept>>): PiElementReference<PiConcept> {
    // console.log("createClassifierReference " + data.name);
    const result = PiElementReference.createNamed<PiConcept>(data.name, "PiClassifier");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createInterfaceReference(data: Partial<PiElementReference<PiInterface>>): PiElementReference<PiInterface> {
    // console.log("createClassifierReference " + data.name);
    const result = PiElementReference.createNamed<PiInterface>(data.name, "PiInterface");
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
        result.props = data.props;
        for (const p of result.props) {
            p.owningInstance = PiElementReference.create<PiInstance>(result, "PiInstance");
        }
    }
    // if the user has not provided a value for the 'name' property,
    // or the instance was defined using the shorthand that simulates enumeration
    // create a value for the 'name' property based on 'data.name'
    if (!(!!data.props) || !data.props.some(prop => prop.name === "name")) {
        const prop = new PiPropertyInstance();
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

export function createPropDef(data: Partial<PiPropertyInstance>): PiPropertyInstance {
    const result = new PiPropertyInstance();
    if (!!data.name) {
        result.name = data.name;
    }
    // in the following statement we cannot use "!!data.value" because it could be a boolean
    // we are not interested in its value, only whether it is present
    if (data.value !== null && data.value !== undefined) {
        if (Array.isArray(data.value)) {
            result.valueList = data.value;
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
