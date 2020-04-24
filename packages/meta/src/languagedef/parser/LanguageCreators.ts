import {
    PiPrimitiveProperty,
    PiConceptProperty,
    PiLanguageUnit,
    PiInterface,
    PiPropertyInstance,
    PiInstance,
    PiExpressionConcept,
    PiBinaryExpressionConcept,
    PiLimitedConcept, PiConcept, PiClassifier
} from "../metalanguage/PiLanguage";
import { PiElementReference } from "../metalanguage/PiElementReference";

// Functions used to create instances of the language classes from the parsed data objects.

export function createLanguage(data: Partial<PiLanguageUnit>): PiLanguageUnit {
    // console.log("createLanguage " + data.name);
    const result = new PiLanguageUnit();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.concepts) {
        for(let con of data.concepts) {
            if (con instanceof PiInterface) {
                result.interfaces.push(con);
            } else {
                result.concepts.push(con);
            }
        }
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConcept(data: Partial<PiConcept>): PiConcept {
    // console.log("createConcept " + data.name);
    const result = new PiConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createLimitedConcept(data: Partial<PiLimitedConcept>): PiLimitedConcept {
    // console.log("createLimitedConcept " + data.name);
    const result = new PiLimitedConcept();
    if (!!data.instances) {
        result.instances = data.instances;
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
    }
    if (!!data.properties) {
        result.properties = data.properties;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

function createCommonConceptProps(data: Partial<PiExpressionConcept>, result: PiConcept) {
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.base) {
        result.base = data.base;
    }
    if (!!data.interfaces) {
        result.interfaces = data.interfaces;
    }
    if (!!data.properties) {
        for(let prop of data.properties) {
            if (prop instanceof PiPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
        }
    }
    if (!!data.location) {
        result.location = data.location;
    }
}

export function createBinaryExpressionConcept(data: Partial<PiBinaryExpressionConcept>): PiBinaryExpressionConcept {
    // console.log("createBinaryExpressionConcept " + data.name);
    const result = new PiBinaryExpressionConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createExpressionConcept(data: Partial<PiExpressionConcept>): PiExpressionConcept {
    // console.log("createExpressionConcept " + data.name);
    const result = new PiExpressionConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createPrimitiveProperty(data: Partial<PiPrimitiveProperty>): PiPrimitiveProperty {
    // console.log("createPrimitiveProperty " + data.name);
    const result = new PiPrimitiveProperty();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.primType) {
        result.primType = data.primType;
    }
    result.isOptional = !!data.isOptional;
    result.isList = !!data.isList;
    result.isPart = true;
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createPartProperty(data: Partial<PiConceptProperty>): PiConceptProperty {
    // console.log("createPartProperty " + data.name);
    const result = new PiConceptProperty();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.type) {
        result.type = data.type;
    }
    result.isOptional = !!data.isOptional;
    result.isList = !!data.isList;
    result.isPart = true;
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createReferenceProperty(data: Partial<PiConceptProperty>): PiConceptProperty {
    // console.log("createReference " + data.name);
    const result = new PiConceptProperty();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.type) {
        result.type = data.type;
    }
    result.isOptional = !!data.isOptional;
    result.isList = !!data.isList;
    result.isPart = false;
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createClassifierReference(data: Partial<PiElementReference<PiClassifier>>): PiElementReference<PiClassifier> {
    // console.log("createConceptReference " + data.name);
    const result = PiElementReference.createNamed<PiClassifier>(data.name, "PiClassifier");
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createInstance(data: Partial<PiInstance>) : PiInstance {
    const result = new PiInstance();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.props) {
        result.props = data.props;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createPropDef(data: Partial<PiPropertyInstance>) : PiPropertyInstance {
    const result = new PiPropertyInstance();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.value) {
        result.value = data.value;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}
