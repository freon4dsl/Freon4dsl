import { FreNode, FreNodeReference } from "../ast";
import { FreLanguage, FreLanguageProperty } from "../language";
import { FreUtils, isNullOrUndefined } from "../util";

/**
 * JSON keys according to the LionWeb specification.
 */
const JSON_CONCEPT_KEY = "concept";
const JSON_ID_KEY = "id";
const JSON_PROPERTIES_KEY = "properties";
const JSON_CHILDREN_KEY = "children";
const JSON_REFERENCES_KEY = "references";
const JSON_REFERENCE_KEY = "reference";
const JSON_SERIALIZATION_FORMAT_KEY = "serializationFormatVersion";
const JSON_NODES_KEY = "nodes";
const JSON_RESOLVE_INFO_KEY = "resolveInfo";

type ParsedChild = {
    featureName: string;
    isList: boolean;
    typeName?: string;
    referredId: string;
};
type ParsedReference = {
    featureName: string;
    isList: boolean;
    typeName?: string;
    referredId: string;
    resolveInfo: string;
};
type ParsedNode = {
    freNode: FreNode;
    children: ParsedChild[];
    references: ParsedReference[];
};


/**
 * Helper class to serialize a model using MobXModelElementImpl.
 * Will take care of model references.
 *
 * Depends on private keys etc. as defined in MobXModelElement decorators.
 */
export class FreLionwebSerializer {
    private language: FreLanguage;
    private nodesfromJson: Map<string, ParsedNode> = new Map<string, ParsedNode>();

    constructor() {
        this.language = FreLanguage.getInstance();
    }

    /**
     * Convert a JSON object formerly JSON-ified by this very class and turn it into
     * a TypeScript object (being an instance of TypeScript class).
     * Works recursively.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): FreNode {
        this.nodesfromJson.clear();
        const serVersion = jsonObject[JSON_SERIALIZATION_FORMAT_KEY];
        console.log("SerializationFormatVersion: " + serVersion);
        // First read all nodes without childeren, etc.
        const nodes: Object[] = jsonObject[JSON_NODES_KEY];
        for (const object of nodes) {
            const parsedNode = this.toTypeScriptInstanceInternal(object);
            this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
        }
        this.resolveChildrenAndReferences();
        return this.findRoot();
    }

    // TODO Hardcoded Form
    private findRoot(): FreNode {
        for (const [id, parsedNode] of this.nodesfromJson.entries()) {
            if (parsedNode.freNode.freLanguageConcept() === "Form") {
                return parsedNode.freNode
            }
        }
        return null;
    }

    private resolveChildrenAndReferences() {
        for (const [id, parsedNode] of this.nodesfromJson.entries()) {
            for (const child of parsedNode.children) {
                const resolvedChild: ParsedNode = this.nodesfromJson.get(child.referredId);
                if (isNullOrUndefined(resolvedChild)) {
                    console.error("Child cannot be resolved: " + child.referredId);
                    continue;
                }
                if (child.isList) {
                    parsedNode.freNode[child.featureName].push(resolvedChild.freNode);
                } else {
                    parsedNode.freNode[child.featureName] = resolvedChild.freNode;
                }
            }
            for (const reference of parsedNode.references) {
                const resolvedReference: ParsedNode = this.nodesfromJson.get(reference.referredId);
                if (isNullOrUndefined(resolvedReference)) {
                    console.error("Reference cannot be resolved: " + reference.referredId);
                    continue;
                }
                // TOIDO Create with id or resolveInfo
                const freonRef: FreNodeReference<any> = FreNodeReference.create(reference.resolveInfo, reference.typeName);
                freonRef.referred = resolvedReference.freNode;
                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef);
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef;
                }

                console.log("REFERENCE: " + freonRef.typeName + ", ", printModel(freonRef.referred) + ", ", freonRef.name + ", " + freonRef.pathname)
            }
        }
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): ParsedNode {
        if (jsonObject === null) {
            throw new Error("Cannot read json: jsonObject is null.");
        }
        const conceptId: string = jsonObject[JSON_CONCEPT_KEY];
        const id: string = jsonObject[JSON_ID_KEY];
        if (isNullOrUndefined(conceptId)) {
            throw new Error(`Cannot read json: not a Freon structure, conceptname missing: ${JSON.stringify(jsonObject)}.`);
        }
        // console.log("Classifier with id " + conceptId + " classifier " + this.language.classifierById(conceptId));
        const tsObject: FreNode = this.language.createConceptOrUnit(this.language.classifierById(conceptId).typeName, id);
        if (isNullOrUndefined(tsObject)) {
            throw new Error(`Cannot read json: ${conceptId} unknown.`);
        }
        this.convertPrimitiveProperties(tsObject, conceptId, jsonObject);
        const parsedChildren = this.convertChildProperties(tsObject, conceptId, jsonObject);
        const parsedReferences = this.convertReferenceProperties(tsObject, conceptId, jsonObject);
        return { freNode: tsObject, children: parsedChildren, references: parsedReferences };
    }

    private convertPrimitiveProperties(freNode: FreNode, concept: string, jsonObject: Object): void {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyKind + " isList " + property.isList);
        const jsonProperties = jsonObject[JSON_PROPERTIES_KEY];
        for (const [key, value] of Object.entries(jsonProperties)) {
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown property: " + key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
            FreUtils.CHECK(property.propertyKind === "primitive", "Primitive value found for non primitive property: " + property.name);
            if (property.type === "string" || property.type === "identifier") {
                // this.checkValueToType(value, "string", property);
                freNode[property.name] = value;
            } else if (property.type === "number") {
                // this.checkValueToType(value, "number", property);
                freNode[property.name] = Number.parseInt(value as string);
            } else if (property.type === "boolean") {
                // this.checkValueToType(value, "boolean", property);
                freNode[property.name] = (value === "true");
            }
        }
    }

    private convertChildProperties(freNode: FreNode, concept: string, jsonObject: Object): ParsedChild[] {
        const jsonChildren = jsonObject[JSON_CHILDREN_KEY];
        const parsedChildren: ParsedChild[] = [];
        for (const [key, jsonValue] of Object.entries(jsonChildren)) {
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown child property: " + key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(property.propertyKind === "part", "Part value found for non part property: " + property.name);
            FreUtils.CHECK(Array.isArray(jsonValue), "Found child value which is not a Array for property: " + property.name);
            for (const item of jsonValue as []) {
                if (!isNullOrUndefined(item)) {
                    parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item });
                }
            }
        }
        return parsedChildren;
    }

    private convertReferenceProperties(freNode: FreNode, concept: string, jsonObject: Object): ParsedReference[] {
        const jsonReferences = jsonObject[JSON_REFERENCES_KEY];
        const parsedChildren: ParsedReference[] = [];
        for (const [key, jsonValue] of Object.entries(jsonReferences)) {
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown reference property: " + key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(property.propertyKind === "reference", "Reference value found for non reference property: " + property.name);
            FreUtils.CHECK(Array.isArray(jsonValue), "Found child value which is not a Array for property: " + property.name);
            for (const item of jsonValue as []) {
                if (!isNullOrUndefined(item)) {
                    if (typeof item === "object") {
                        // New reference format with resolveInfo
                        parsedChildren.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item[JSON_REFERENCE_KEY],
                            resolveInfo: item[JSON_RESOLVE_INFO_KEY]
                        });
                    } else if (typeof item === "string") {
                        // OLD reference format, just an id
                        parsedChildren.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item,
                            resolveInfo: ""
                        });
                    } else {
                        console.log("Incorrect refeerence format: " + JSON.stringify(item));
                    }
                }
            }
        }
        return parsedChildren;
    }

    private checkValueToType(value: any, shouldBeType: string, property: FreLanguageProperty) {
        if (typeof value !== shouldBeType) {
            throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
        }
    }

    /**
     * Create JSON Object, storing references as names.
     */
    public convertToJSON(tsObject: FreNode, publicOnly?: boolean): Object {
        const typename = tsObject.freLanguageConcept();
        // console.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);
        let result: Object;
        if (publicOnly !== undefined && publicOnly) {
            // convert all units and all public concepts
            if (this.language.concept(typename)?.isPublic || !!this.language.unit(typename)) {
                result = this.convertToJSONinternal(tsObject, true, typename);
            }
        } else {
            result = this.convertToJSONinternal(tsObject, false, typename);
        }
        // console.log("end converting concept name " + tsObject.freLanguageConcept());
        return result;
    }

    private convertToJSONinternal(tsObject: FreNode, publicOnly: boolean, typename: string): Object {
        const result: Object = { $typename: typename };
        // console.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // console.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            if (publicOnly) {
                if (p.isPublic) {
                    this.convertPropertyToJSON(p, tsObject, publicOnly, result);
                }
            } else {
                this.convertPropertyToJSON(p, tsObject, publicOnly, result);
            }
            // console.log("<<<< end converting property  " + p.name);
        }
        return result;
    }

    private convertPropertyToJSON(p: FreLanguageProperty, tsObject: FreNode, publicOnly: boolean, result: Object) {
        switch (p.propertyKind) {
            case "part":
                const value = tsObject[p.name];
                if (p.isList) {
                    const parts: Object[] = tsObject[p.name];
                    result[p.name] = [];
                    for (let i: number = 0; i < parts.length; i++) {
                        result[p.name][i] = this.convertToJSON(parts[i] as FreNode, publicOnly);
                    }
                } else {
                    // single value
                    result[p.name] = !!value ? this.convertToJSON(value as FreNode, publicOnly) : null;
                }
                break;
            case "reference":
                if (p.isList) {
                    const references: Object[] = tsObject[p.name];
                    result[p.name] = [];
                    for (let i: number = 0; i < references.length; i++) {
                        result[p.name][i] = references[i]["name"];
                    }
                } else {
                    // single reference
                    const value1 = tsObject[p.name];
                    result[p.name] = !!value1 ? tsObject[p.name]["name"] : null;
                }
                break;
            case "primitive":
                const value2 = tsObject[p.name];
                result[p.name] = value2;
                break;
            default:
                break;
        }
    }
}

function printModel(element: FreNode): string {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"];// "$id"];

function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof FreNodeReference) {
        return "REF --|" ;
    }else {
        return value;
    }
}
