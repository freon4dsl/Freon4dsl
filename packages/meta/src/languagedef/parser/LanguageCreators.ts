import {
    PiPrimitiveProperty,
    PiConceptProperty,
    PiLanguageUnit,
    PiInterface,
    PiPropertyInstance,
    PiInstance,
    PiExpressionConcept,
    PiBinaryExpressionConcept,
    PiLimitedConcept, PiConcept, PiClassifier, PiProperty
} from "../metalanguage/PiLanguage";
import { PiElementReference } from "../metalanguage/PiElementReference";

// Functions used to create instances of the language classes from the parsed data objects.

export function createLanguage(data: Partial<PiLanguageUnit>): PiLanguageUnit {
    // console.log("createLanguage " + data.unitName);
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
            con.language = result;
        }
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConcept(data: Partial<PiConcept>): PiConcept {
    // console.log("createConcept " + data.unitName);
    const result = new PiConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createLimitedConcept(data: Partial<PiLimitedConcept>): PiLimitedConcept {
    // console.log("createLimitedConcept " + data.unitName);
    const result = new PiLimitedConcept();
    if (!!data.instances) {
        result.instances = data.instances;
        for (let inst of result.instances) {
            inst.concept = PiElementReference.create<PiLimitedConcept>(result, "PiLimitedConcept");
            inst.concept.owner = inst;
        }
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createInterface(data: Partial<PiInterface>): PiInterface {
    // console.log("createInterface " + data.unitName);
    const result = new PiInterface();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.base) {
        result.base = data.base;
        for (let intf of result.base) {
            intf.owner = result;
        }
    }
    if (!!data.properties) {
        for(let prop of data.properties) {
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
        for (let intf of result.interfaces) {
            intf.owner = result;
        }
    }
    if (!!data.properties) {
        for(let prop of data.properties) {
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
    }
}

export function createBinaryExpressionConcept(data: Partial<PiBinaryExpressionConcept>): PiBinaryExpressionConcept {
    // console.log("createBinaryExpressionConcept " + data.unitName);
    const result = new PiBinaryExpressionConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    if( !!data.priority ) {
        result.priority = data.priority;
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createExpressionConcept(data: Partial<PiExpressionConcept>): PiExpressionConcept {
    // console.log("createExpressionConcept " + data.unitName);
    const result = new PiExpressionConcept();
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

function createCommonPropertyAttrs(data: Partial<PiProperty>, result: PiProperty) {
    if (!!data.name) {
        result.name = data.name;
    }
    result.isOptional = !!data.isOptional;
    result.isList = !!data.isList;
    if (!!data.location) {
        result.location = data.location;
    }
}

export function createPrimitiveProperty(data: Partial<PiPrimitiveProperty>): PiPrimitiveProperty {
    // console.log("createPrimitiveProperty " + data.unitName);
    const result = new PiPrimitiveProperty();
    result.isPart = true;
    if (!!data.primType) {
        result.primType = data.primType;
    }
    createCommonPropertyAttrs(data, result);
    return result;
}

export function createPartProperty(data: Partial<PiConceptProperty>): PiConceptProperty {
    // console.log("createPartProperty " + data.unitName);
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
    // console.log("createReference " + data.unitName);
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
    // console.log("createClassifierReference " + data.unitName);
    const result = PiElementReference.createNamed<PiConcept>(data.name, "PiConcept");
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createClassifierReference(data: Partial<PiElementReference<PiConcept>>): PiElementReference<PiConcept> {
    // console.log("createClassifierReference " + data.unitName);
    const result = PiElementReference.createNamed<PiConcept>(data.name, "PiClassifier");
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createInterfaceReference(data: Partial<PiElementReference<PiInterface>>): PiElementReference<PiInterface> {
    // console.log("createClassifierReference " + data.unitName);
    const result = PiElementReference.createNamed<PiInterface>(data.name, "PiInterface");
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
        for (let p of result.props) {
            p.owningInstance = PiElementReference.create<PiInstance>(result, "PiInstance");
        }
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
