import { IdMap } from "../../commandline/IdMap";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaExpressionConcept,
    FreMetaInterface,
    FreMetaInstance,
    FreMetaInstanceProperty,
    FreMetaModelDescription,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
    FreMetaProperty,
    FreMetaUnitDescription,
    MetaElementReference
} from "../metalanguage";
import { ParseLocationUtil } from "../../utils";

// Functions used to create instances of the language classes from the parsed data objects.
let currentFileName: string = "SOME_FILENAME";
// The id's and key's of the language elements as needed by LionWeb.
let LanguageCreators_idMap: IdMap = new IdMap();
export function setIdMap(idMap: IdMap): void {
    LanguageCreators_idMap = idMap;
}

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

export function createLanguage(data: Partial<FreMetaLanguage>): FreMetaLanguage {
    // console.log("createLanguage " + data.name);
    const result = new FreMetaLanguage();
    if (!!data.name) {
        result.name = data.name;
        result.id = LanguageCreators_idMap.getLanguageId(result.name);
        result.key = LanguageCreators_idMap.getLanguageKey(result.name);
        console.log("LANGUAGE NAME IS [" + data.name + "] " + "key " + result.key + " id " + result.id);
        result.usedLanguages.push(data.name);
    }
    if (!!data.concepts) {
        let hasModel: boolean = false;
        for (const con of data.concepts) {
            con.language = result;
            if (con instanceof FreMetaInterface) {
                result.interfaces.push(con);
            } else if (con instanceof FreMetaModelDescription) {
                if (hasModel) {
                    let location: string = `[no location]`;
                    if (!!con.location) {
                        location = ParseLocationUtil.locationPlus(currentFileName, con.location);
                    }
                    nonFatalParseErrors.push(`There may be only one model in the language definition ${location}.`);
                } else {
                    hasModel = true;
                    result.modelConcept = con;
                }
            } else if (con instanceof FreMetaUnitDescription) {
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

function splitProperties(propList: FreMetaProperty[], result: FreMetaClassifier) {
    for (const prop of propList) {
        if (prop instanceof FreMetaPrimitiveProperty) {
            result.primProperties.push(prop);
        } else {
            result.properties.push(prop);
        }
        prop.owningClassifier = result;
        prop.id = LanguageCreators_idMap.getPropertyId(result.name, prop.name);
        prop.key = LanguageCreators_idMap.getPropertyKey(result.name, prop.name);
    }
}

export function createModel(data: Partial<FreMetaModelDescription>): FreMetaModelDescription {
    // console.log("createModel " + data.name);
    const result = new FreMetaModelDescription();
    if (!!data.name) {
        result.name = data.name;
        result.id = LanguageCreators_idMap.getConceptId(result.name);
        result.key = LanguageCreators_idMap.getConceptKey(result.name);
    }
    if (!!data.properties) {
        splitProperties(data.properties, result);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createUnit(data: Partial<FreMetaUnitDescription>): FreMetaUnitDescription {
    // console.log("createUnit " + data.name);
    const result = new FreMetaUnitDescription();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.properties) {
        for (const prop of data.properties) {
            if (prop instanceof FreMetaPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
            prop.id = LanguageCreators_idMap.getPropertyId(result.name, prop.name);
            prop.key = LanguageCreators_idMap.getPropertyKey(result.name, prop.name);
        }
    }
    if (!!data.interfaces) {
        result.interfaces = data.interfaces;
        for (const intf of result.interfaces) {
            intf.owner = result;
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

export function createConcept(data: Partial<FreMetaConcept>): FreMetaConcept {
    // console.log("createConceptOrUnit " + data.name);
    const result = new FreMetaConcept();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

export function createLimitedConcept(data: Partial<FreMetaLimitedConcept>): FreMetaLimitedConcept {
    // console.log("createLimitedConcept " + data.name);
    const result = new FreMetaLimitedConcept();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
    result.isAbstract = !!data.isAbstract;
    if (!!data.instances) {
        result.instances = data.instances;
        for (const inst of result.instances) {
            inst.concept = MetaElementReference.create<FreMetaLimitedConcept>(result, "FreLimitedConcept");
            inst.concept.owner = inst;
        }
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createInterface(data: Partial<FreMetaInterface>): FreMetaInterface {
    // console.log("createInterface " + data.name);
    const result = new FreMetaInterface();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
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
        splitProperties(data.properties, result);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

function createCommonConceptProps(data: Partial<FreMetaExpressionConcept>, result: FreMetaConcept) {
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
            if (prop instanceof FreMetaPrimitiveProperty) {
                result.primProperties.push(prop);
            } else {
                result.properties.push(prop);
            }
            prop.owningClassifier = result;
            prop.id = LanguageCreators_idMap.getPropertyId(result.name, prop.name);
            prop.key = LanguageCreators_idMap.getPropertyKey(result.name, prop.name);
        }
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
}

export function createBinaryExpressionConcept(data: Partial<FreMetaBinaryExpressionConcept>): FreMetaBinaryExpressionConcept {
    // console.log("createBinaryExpressionConcept " + data.name);
    const result = new FreMetaBinaryExpressionConcept();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
    result.isAbstract = !!data.isAbstract;
    if ( !!data.priority ) {
        result.priority = data.priority;
    }
    createCommonConceptProps(data, result);
    return result;
}

export function createExpressionConcept(data: Partial<FreMetaExpressionConcept>): FreMetaExpressionConcept {
    // console.log("createExpressionConcept " + data.name);
    const result = new FreMetaExpressionConcept();
    result.id = LanguageCreators_idMap.getConceptId(data.name);
    result.key = LanguageCreators_idMap.getConceptKey(data.name);
    result.isAbstract = !!data.isAbstract;
    createCommonConceptProps(data, result);
    return result;
}

function createCommonPropertyAttrs(data: Partial<FreMetaProperty>, result: FreMetaProperty) {
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
export function createPartOrPrimProperty(data: Partial<FreMetaPrimitiveProperty>): FreMetaProperty {
    // console.log("createPartOrPrimProperty " + data.name + " "+ data.typeReference + " "+ data.typeName);
    // Note that we use 'data.typeReference', because at this stage we only have the name of the type, not the object itself.
    let result: FreMetaProperty;
    // In the following we ignore data.initialValue for Part Properties (i.e. props where the type is a Concept).
    // But we do add an error message to the list of non-fatal parse errors.
    // This list of errors is added to the list of checking errors in the parse functions in FreParser.
    if (!!data.typeReference) {
        // NOTE that the following check can NOT be '.typeReference.referred === FrePrimitiveType.identifier' etc.
        // '.typeReference.referred' is determine by the scoper, which does not function when not all concepts are known AND
        // the language attribute of the concepts has been set. The latter is done in 'createLanguage', which is called
        // after this function is called!!
        const refName = data.typeReference.name;
        if (refName === "string" || refName === "boolean" || refName === "number" || refName === "identifier") {
            const primitiveProperty = new FreMetaPrimitiveProperty();
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
            const conceptProperty = new FreMetaConceptProperty();
            // in the following statement we cannot use "!!data.initialValue" because it could be a boolean
            // we are not interested in its value, only whether it is present
            if (data.initialValue !== null && data.initialValue !== undefined) {
                nonFatalParseErrors.push(`A non-primitive property may not have an initial value ${ParseLocationUtil.locationPlus(currentFileName, data.location)}.`);
            }
            result = conceptProperty;
        }
        result.typeReference = data.typeReference;
    }
    result.isPart = true;
    createCommonPropertyAttrs(data, result);
    return result;
}

export function createReferenceProperty(data: Partial<FreMetaConceptProperty>): FreMetaConceptProperty {
    // console.log("createReference " + data.name);
    const result = new FreMetaConceptProperty();
    result.isPart = false;
    createCommonPropertyAttrs(data, result);
    if (!!data.typeReference) {
        result.typeReference = data.typeReference;
    }
    return result;
}

export function createClassifierReference(data: Partial<MetaElementReference<FreMetaClassifier>>): MetaElementReference<FreMetaClassifier> {
    // console.log("createClassifierReference " + data.name);
    let result: MetaElementReference<FreMetaClassifier> = null;
    if (!!data.name) {
        const type: string = data.name;
        if (type === "string") {
            result = MetaElementReference.create<FreMetaPrimitiveType>(FreMetaPrimitiveType.string, "FrePrimitiveType");
        } else if (type === "boolean") {
            result = MetaElementReference.create<FreMetaPrimitiveType>(FreMetaPrimitiveType.boolean, "FrePrimitiveType");
        } else if (type === "number") {
            result = MetaElementReference.create<FreMetaPrimitiveType>(FreMetaPrimitiveType.number, "FrePrimitiveType");
        } else if (type === "identifier") {
            result = MetaElementReference.create<FreMetaPrimitiveType>(FreMetaPrimitiveType.identifier, "FrePrimitiveType");
        } else {
            result = MetaElementReference.create<FreMetaClassifier>(data.name, "FreClassifier");
        }
    }
    if (!!result && !!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }

    return result;
}

export function createInterfaceReference(data: Partial<MetaElementReference<FreMetaInterface>>): MetaElementReference<FreMetaInterface> {
    // console.log("createInterfaceReference " + data.name);
    const result = MetaElementReference.create<FreMetaInterface>(data.name, "FreInterface");
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createInstance(data: Partial<FreMetaInstance>): FreMetaInstance {
    const result = new FreMetaInstance();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.props) {
        result.props.push(...data.props);
        for (const p of result.props) {
            p.owningInstance = MetaElementReference.create<FreMetaInstance>(result, "FreInstance");
        }
    }
    // if the user has not provided a value for the 'name' property,
    // or the instance was defined using the shorthand that simulates enumeration
    // create a value for the 'name' property based on 'data.name'
    if (!(!!data.props) || !data.props.some(prop => prop.name === "name")) {
        const prop = new FreMetaInstanceProperty();
        prop.name = "name";
        prop.value = data.name;
        prop.owningInstance = MetaElementReference.create<FreMetaInstance>(result, "FreInstance");
        prop.location = data.location;
        result.props.push(prop);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createPropDef(data: Partial<FreMetaInstanceProperty>): FreMetaInstanceProperty {
    const result = new FreMetaInstanceProperty();
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
