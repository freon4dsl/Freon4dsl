import { FreNamedNode, FreNode, FreNodeReference } from "../ast";
import { FreLanguage, FreLanguageProperty } from "../language";
import { FreUtils, isNullOrUndefined } from "../util";
import { FreSerializer } from "./FreSerializer";
import { createLwNode, isLwChunk, LwChild, LwChunk, LwMetaPointer, LwNode, LwReference } from "./LionwebM3";

/**
 * Helper types for nodes parsed from a Lionweb JSON.
 */
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

export class FreLionwebSerializer implements FreSerializer {
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
        console.log("toTypeScriptInstance");
        this.nodesfromJson.clear();
        FreLanguage.getInstance().stdLib.elements.forEach(elem =>
            this.nodesfromJson.set(elem.freId(), {freNode: elem, children: [], references: []})
        );
        console.log("Starting ...")
        // TODO Does not work, as there never is an instance of class LwChuld being constructed.
        if (!isLwChunk(jsonObject)) {
            console.log(`Cannot read json: jsonObject is not a LIonWeb chunk:`);
        }
        // console.log(`jsonObject ${JSON.stringify(jsonObject)}`);
        const chunk = jsonObject as LwChunk;
        const serVersion = chunk.serializationFormatVersion;
        console.log("SerializationFormatVersion: " + serVersion);
        // First read all nodes without children, and store them in a map.
        const nodes: LwNode[] = chunk.nodes;
        for (const object of nodes) {
            console.log("node: " + object.concept.key + "     with id " + object.id)
            const parsedNode = this.toTypeScriptInstanceInternal(object);
            if (parsedNode !== null) {
                this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
            }
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
                // const resolvedReference: ParsedNode = this.nodesfromJson.get(reference.referredId);
                // if (isNullOrUndefined(resolvedReference)) {
                //     console.error("Reference cannot be resolved: " + reference.referredId);
                //     continue;
                // }
                // TOIDO Create with id or resolveInfo
                const freonRef: FreNodeReference<any> = FreNodeReference.create(reference.resolveInfo, reference.typeName);
                // freonRef.referred = resolvedReference.freNode;
                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef);
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef;
                }

                // console.log("REFERENCE: " + freonRef.typeName + ", ", printModel(freonRef.referred) + ", ", freonRef.name + ", " + freonRef.pathname);
            }
        }
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param lwNode JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(lwNode: LwNode): ParsedNode {
        if (lwNode === null) {
            throw new Error("Cannot read json: jsonObject is null.");
        }
        const jsonMetaPointer = lwNode.concept;
        const id: string = lwNode.id;
        if (isNullOrUndefined(jsonMetaPointer)) {
            throw new Error(`Cannot read json: not a Freon structure, conceptname missing: ${JSON.stringify(lwNode)}.`);
        }
        const conceptMetaPointer = this.convertMetaPointer(jsonMetaPointer, lwNode);
        // console.log("Classifier with id " + conceptId + " classifier " + this.language.classifierById(conceptId));
        const classifier = this.language.classifierById(conceptMetaPointer.key);
        if (isNullOrUndefined(classifier)) {
            console.log(`1 Cannot read json: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        const tsObject: FreNode = this.language.createConceptOrUnit(classifier.typeName, id);
        if (isNullOrUndefined(tsObject)) {
            console.log(`2 Cannot read json: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        this.convertPrimitiveProperties(tsObject, conceptMetaPointer.key, lwNode);
        const parsedChildren = this.convertChildProperties(tsObject, conceptMetaPointer.key, lwNode);
        const parsedReferences = this.convertReferenceProperties(tsObject, conceptMetaPointer.key, lwNode);
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
                // FIXME known prpblems
                if( propertyMetaPointer.key !== "qualifiedName")
                console.log("Unknown property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
            FreUtils.CHECK(property.propertyKind === "primitive", "Primitive value found for non primitive property: " + property.name);
            const value = jsonProperty.value;
            if (isNullOrUndefined(value)) {
                throw new Error(`Cannot read json: ${JSON.stringify(property, null, 2)} value unset.`);
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
    public convertToJSON(freNode: FreNode, publicOnly?: boolean): LwNode[] {
        const typename = freNode.freLanguageConcept();
        console.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);

        const idMap = new Map<string, LwNode>();
        let root: LwNode;
        if (publicOnly !== undefined && publicOnly) {
            // convert all units and all public concepts
            if (this.language.concept(typename)?.isPublic || !!this.language.unit(typename)) {
                root = this.convertToJSONinternal(freNode, true, idMap);
            }
        } else {
            root = this.convertToJSONinternal(freNode, false, idMap);
        }
        console.log("end converting concept name " + JSON.stringify(Object.values(idMap)));
        return Object.values(idMap);
    }

    private convertToJSONinternal(freNode: FreNode, publicOnly: boolean, idMap: Map<string, LwNode>): LwNode {
        let result = idMap.get(freNode.freId());
        if (result !== undefined) {
            console.log("already found", freNode.freId());
            return result;
        }
        const typename = freNode.freLanguageConcept();
        result = createLwNode();
        idMap[freNode.freId()] = result;
        result.id = freNode.freId();

        let conceptKey: string;
        const concept = this.language.concept(typename);
        if (concept !== undefined) {
            conceptKey = concept.id;
        } else {
          const unit = this.language.unit(typename);
          conceptKey = unit?.id;
        }
        if (conceptKey === undefined) {
            console.log(`Unknown concept key: ${typename}`);
            return undefined;
        }
        result.concept = this.createMetaPointer(conceptKey);
        // console.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // console.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            if (publicOnly) {
                if (p.isPublic) {
                    this.convertPropertyToJSON(p, freNode, publicOnly, result, idMap);
                }
            } else {
                this.convertPropertyToJSON(p, freNode, publicOnly, result, idMap);
            }
            // console.log("<<<< end converting property  " + p.name);
        }
        return result;
    }

    private createMetaPointer(key: string) {
        return {
            key: key,
            version: "1.0",
            metamodel: this.language.id
        };
    }

    private convertPropertyToJSON(p: FreLanguageProperty, parentNode: FreNode, publicOnly: boolean, result: LwNode, idMap: Map<string, LwNode>) {
        const typename = parentNode.freLanguageConcept();
        if (p.id === undefined) {
            console.log(`no id defined for property ${p.name}`);
            return;
        }
        switch (p.propertyKind) {
            case "part":
                const value = parentNode[p.name];
                const child: LwChild = {
                    containment: this.createMetaPointer(p.id),
                    children: []
                };
                if (p.isList) {
                    const parts: FreNode[] = parentNode[p.name];
                    for (const part of parts) {
                        child.children.push(this.convertToJSONinternal(part , publicOnly, idMap).id);
                    }
                } else {
                    // single value
                    child.children.push((!!value ? this.convertToJSONinternal(value as FreNode, publicOnly, idMap) : null).id);
                }
                result.children.push(child);
                break;
            case "reference":
                const lwReference: LwReference = {
                    reference: this.createMetaPointer(p.id),
                    targets: []
                };
                if (p.isList) {
                    const references: FreNodeReference<FreNamedNode>[] = parentNode[p.name];
                    for (const ref of references) {
                        lwReference.targets.push({
                            reference: ref?.referred?.freId(),
                            resolveInfo: ref["name"]
                        });
                    }
                } else {
                    // single reference
                    const ref: FreNodeReference<FreNamedNode> = parentNode[p.name];
                    lwReference.targets.push({
                        reference: ref?.referred?.freId(),
                        resolveInfo: !!ref ? ref["name"] : null
                    });
                }
                result.references.push(lwReference);
                break;
            case "primitive":
                const value2 = parentNode[p.name];
                result.properties.push({
                    property: this.createMetaPointer(p.id),
                    value: value2
                });
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
