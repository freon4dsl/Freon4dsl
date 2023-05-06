import { FreNode, FreNodeReference } from "../ast";
import { FreLanguage, FreLanguageProperty } from "../language";
import { FreUtils, isNullOrUndefined } from "../util";

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
class LwMetaPointer {
    metamodel: string;
    version: string;
    key: string;
}

class LwChunk {
    serializationFormatVersion: string;
    metamodels: LwUsedLanguage[];
    nodes: LwNode[];
}

class LwUsedLanguage {
    key: string;
    version: string;
}

class LwNode {
    id: string;
    concept: LwMetaPointer;
    properties: LwProperty[];
    children: LwChild[];
    references: LwReference[];
    parent: string;
}

class LwProperty {
    property: LwMetaPointer;
    value: string;
}

class LwChild {
    containment: LwMetaPointer;
    children: string[];
}

class LwReference {
    reference: LwMetaPointer;
    targets: LwTarget[];
}

class LwTarget {
    resolveInfo: string;
    reference: string;
}

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
        if (!(jsonObject instanceof LwChunk)) {
            throw new Error(`Cannot read json: jsonObject is not a LIonWeb chunk: ${JSON.stringify(jsonObject)}`);
        }
        const serVersion = jsonObject.serializationFormatVersion;
        console.log("SerializationFormatVersion: " + serVersion);
        // First read all nodes without childeren, etc.
        const nodes: LwNode[] = jsonObject.nodes;
        for (const object of nodes) {
            const parsedNode = this.toTypeScriptInstanceInternal(object);
            this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
        }
        this.resolveChildrenAndReferences();
        return this.findRoot();
    }

    private findRoot(): FreNode {
        for (const [id, parsedNode] of this.nodesfromJson.entries()) {
            if (parsedNode.freNode.freIsUnit()) {
                return parsedNode.freNode;
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

                console.log("REFERENCE: " + freonRef.typeName + ", ", printModel(freonRef.referred) + ", ", freonRef.name + ", " + freonRef.pathname);
            }
        }
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: LwNode): ParsedNode {
        if (jsonObject === null) {
            throw new Error("Cannot read json: jsonObject is null.");
        }
        const jsonMetaPointer = jsonObject.concept;
        const id: string = jsonObject.id;
        if (isNullOrUndefined(jsonMetaPointer)) {
            throw new Error(`Cannot read json: not a Freon structure, conceptname missing: ${JSON.stringify(jsonObject)}.`);
        }
        const conceptMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
        // console.log("Classifier with id " + conceptId + " classifier " + this.language.classifierById(conceptId));
        const classifier = this.language.classifierById(conceptMetaPointer.key);
        if (isNullOrUndefined(classifier)) {
            throw new Error(`Cannot read json: ${conceptMetaPointer.key} unknown.`);
        }
        const tsObject: FreNode = this.language.createConceptOrUnit(classifier.typeName, id);
        if (isNullOrUndefined(tsObject)) {
            throw new Error(`Cannot read json: ${conceptMetaPointer.key} unknown.`);
        }
        this.convertPrimitiveProperties(tsObject, conceptMetaPointer.key, jsonObject);
        const parsedChildren = this.convertChildProperties(tsObject, conceptMetaPointer.key, jsonObject);
        const parsedReferences = this.convertReferenceProperties(tsObject, conceptMetaPointer.key, jsonObject);
        return { freNode: tsObject, children: parsedChildren, references: parsedReferences };
    }

    private convertPrimitiveProperties(freNode: FreNode, concept: string, jsonObject: LwNode): void {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyKind + " isList " + property.isList);
        const jsonProperties = jsonObject.properties;
        FreUtils.CHECK(Array.isArray(jsonProperties), "Found properties value which is not a Array for node: " + jsonObject.id);
        for (const jsonProperty of Object.values(jsonProperties)) {
            const jsonMetaPointer = jsonProperty.property;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, propertyMetaPointer.key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
            FreUtils.CHECK(property.propertyKind === "primitive", "Primitive value found for non primitive property: " + property.name);
            const value = jsonProperty.value;
            if (isNullOrUndefined(value)) {
                throw new Error(`Cannot read json: ${property} value unset.`);
            }
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

    private convertMetaPointer(jsonObject: LwMetaPointer, parent: Object): LwMetaPointer {
        if (isNullOrUndefined(jsonObject)) {
            throw new Error(`Cannot read json: not a MetaPointer: ${JSON.stringify(parent)}.`);
        }

        const metamodel = jsonObject.metamodel;
        if (isNullOrUndefined(metamodel)) {
            throw new Error(`MetaPointer misses metamodel: ${JSON.stringify(jsonObject)}`);
        }
        const version = jsonObject.version;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses version: ${JSON.stringify(jsonObject)}`);
        }
        const key = jsonObject.key;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses key: ${JSON.stringify(jsonObject)}`);
        }
        return {
            metamodel: metamodel,
            version: version,
            key: key
        };
    }

    private convertChildProperties(freNode: FreNode, concept: string, jsonObject: LwNode): ParsedChild[] {
        const jsonChildren = jsonObject.children;
        FreUtils.CHECK(Array.isArray(jsonChildren), "Found children value which is not a Array for node: " + jsonObject.id);
        const parsedChildren: ParsedChild[] = [];
        for (const jsonChild of Object.values(jsonChildren)) {
            const jsonMetaPointer = jsonChild.containment;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, propertyMetaPointer.key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown child property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(property.propertyKind === "part", "Part value found for non part property: " + property.name);
            const jsonValue = jsonChild.children;
            FreUtils.CHECK(Array.isArray(jsonValue), "Found child value which is not a Array for property: " + property.name);
            for (const item of jsonValue as []) {
                if (!isNullOrUndefined(item)) {
                    parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item });
                }
            }
        }
        return parsedChildren;
    }

    private convertReferenceProperties(freNode: FreNode, concept: string, jsonObject: LwNode): ParsedReference[] {
        const jsonReferences = jsonObject.references;
        FreUtils.CHECK(Array.isArray(jsonReferences), "Found references value which is not a Array for node: " + jsonObject.id);
        const parsedReferences: ParsedReference[] = [];
        for (const jsonReference of Object.values(jsonReferences)) {
            const jsonMetaPointer = jsonReference.reference;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyById(concept, propertyMetaPointer.key);
            if (isNullOrUndefined(property)) {
                console.log("Unknown reference property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(property.propertyKind === "reference", "Reference value found for non reference property: " + property.name);
            const jsonValue = jsonReference.targets;
            FreUtils.CHECK(Array.isArray(jsonValue), "Found targets value which is not a Array for property: " + property.name);
            for (const item of jsonValue) {
                if (!isNullOrUndefined(item)) {
                    if (typeof item === "object") {
                        // New reference format with resolveInfo
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item.reference,
                            resolveInfo: item.resolveInfo
                        });
                    } else if (typeof item === "string") {
                        // OLD reference format, just an id
                        parsedReferences.push({
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
        return parsedReferences;
    }

    private checkValueToType(value: any, shouldBeType: string, property: FreLanguageProperty) {
        if (typeof value !== shouldBeType) {
            throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
        }
    }

    /**
     * Create JSON Object, storing references as names.
     */
    public convertToJSON(freNode: FreNode, publicOnly?: boolean): Object {
        const typename = freNode.freLanguageConcept();
        // console.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);
        let result: Object;
        if (publicOnly !== undefined && publicOnly) {
            // convert all units and all public concepts
            if (this.language.concept(typename)?.isPublic || !!this.language.unit(typename)) {
                result = this.convertToJSONinternal(freNode, true, typename);
            }
        } else {
            result = this.convertToJSONinternal(freNode, false, typename);
        }
        // console.log("end converting concept name " + tsObject.freLanguageConcept());
        return result;
    }

    private convertToJSONinternal(freNode: FreNode, publicOnly: boolean, typename: string): Object {
        const result: Object = { $typename: typename };
        // console.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // console.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            if (publicOnly) {
                if (p.isPublic) {
                    this.convertPropertyToJSON(p, freNode, publicOnly, result);
                }
            } else {
                this.convertPropertyToJSON(p, freNode, publicOnly, result);
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
    return JSON.stringify(element, skipReferences, "  " );
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"]; // "$id"];

function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if ( value instanceof FreNodeReference) {
        return "REF --|" ;
    } else {
        return value;
    }
}
