// import { astToString } from "../../ast-utils/index.js";
import type { LionWebJsonChunk, LionWebJsonContainment, LionWebJsonMetaPointer, LionWebJsonNode, LionWebJsonReference } from "@lionweb/json";
import { runInAction } from "mobx";
import type { FreNamedNode, FreNode } from "../../ast/index.js";
import { FreNodeReference } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js";
import type { FreLanguageProperty } from "../../language/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils, isNullOrUndefined, jsonAsString, notNullOrUndefined } from '../../util/index.js';
import type { FreSerializer } from "./FreSerializer.js";
import { createLionWebJsonNode, isLionWebJsonChunk } from "./NewLionwebM3.js";


const LOGGER = new FreLogger("FreLionwebSerializer");
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
     * THis methos assumes that the _jsonObject_ is a LionWeb chunk, representing one model unit.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): FreNode {
        LOGGER.log("toTypeScriptInstance");
        this.nodesfromJson.clear();
        FreLanguage.getInstance().stdLib.elements.forEach((elem) =>
            this.nodesfromJson.set(elem.freId(), { freNode: elem, children: [], references: [] }),
        );
        LOGGER.log("Starting ...");
        // TODO Does not work, as there never is an instance of class LwChuld being constructed.
        if (!isLionWebJsonChunk(jsonObject)) {
            LOGGER.error(`Cannot read json: jsonObject is not a LionWeb chunk:`);
        }
        const chunk = jsonObject as LionWebJsonChunk;
        const serVersion = chunk.serializationFormatVersion;
        LOGGER.log("SerializationFormatVersion: " + serVersion);
        // First read all nodes without children, and store them in a map.
        const nodes: LionWebJsonNode[] = chunk.nodes;
        // Not using AST.change(...) here, because we don't need an undo for this code
        runInAction( () => {
            for (const node of nodes) {
                // LOGGER.log("node: " + object.concept.key + "     with id " + object.id)
                const parsedNode = this.toTypeScriptInstanceInternal(node);
                if (parsedNode !== null) {
                    this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
                }
            }
            LOGGER.info("resolving children")
            this.resolveChildrenAndReferences();
            LOGGER.info("resolved children")
        })
        LOGGER.log("toTypeScriptInstance done with root")
        LOGGER.log("toTypeScriptInstance " + this.findRoot())
        return this.findRoot();
    }

    /**
     * We assume that there is exactly one unit node.
     * @private
     */
    private findRoot(): FreNode {
        // TODO Check next line
        const mapEntries: IterableIterator<ParsedNode> = this.nodesfromJson.values();
        for (const parsedNode of mapEntries) {
            if (parsedNode.freNode.freIsUnit()) {
                return parsedNode.freNode;
            }
        }
        return null;
    }

    private resolveChildrenAndReferences() {
        // TODO Check next line
        const mapEntries: IterableIterator<ParsedNode> = this.nodesfromJson.values();
        for (const parsedNode of mapEntries) {
            LOGGER.log(`resolveChildrenAndReferences or node ${parsedNode.freNode.freId()}`)
            for (const child of parsedNode.children) {
                LOGGER.info(`resolving child ` + jsonAsString(child))
                const resolvedChild: ParsedNode = this.nodesfromJson.get(child.referredId);
                LOGGER.info(`resolvedChild ${resolvedChild?.freNode?.freId()}`)
                if (isNullOrUndefined(resolvedChild)) {
                    LOGGER.error("Child cannot be resolved: " + child.referredId);
                    continue;
                }
                if (child.isList) {
                    LOGGER.info(`isList ${child.featureName} ${child.isList} '${child.typeName}' + '${typeof parsedNode.freNode[child.featureName]}'`)
                    LOGGER.info(`      '${Array.isArray(parsedNode.freNode[child.featureName])}' push '${resolvedChild.freNode.freId()}'`)
                    parsedNode.freNode[child.featureName].push(resolvedChild.freNode);
                    LOGGER.info("pushed")
                } else {
                    LOGGER.info("NOT isList")
                    parsedNode.freNode[child.featureName] = resolvedChild.freNode;
                }
                LOGGER.info(`resolved child `)
            }
            for (const reference of parsedNode.references) {
                // LOGGER.info(`resolving reference ` + jsonAsString(reference))
                // const resolvedReference: ParsedNode = this.nodesfromJson.get(reference.referredId);
                // if (isNullOrUndefined(resolvedReference)) {
                //     LOGGER.error("Reference cannot be resolved: " + reference.referredId);
                //     continue;
                // }
                // TOIDO Create with id or resolveInfo
                const freonRef: FreNodeReference<any> = FreNodeReference.create(
                    reference.resolveInfo,
                    reference.typeName,
                );
                // freonRef.referred = resolvedReference.freNode;
                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef);
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef;
                }

                LOGGER.log("resolved reference: " + freonRef.typeName)
            }
        }
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param LionWebJsonNode JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(node: LionWebJsonNode): ParsedNode {
        LOGGER.info("toTypeScriptInstanceInternal node " + node.id)
        if (node === null) {
            throw new Error("Cannot read json 1: jsonObject is null.");
        }
        const jsonMetaPointer = node.classifier;
        const id: string = node.id;
        if (isNullOrUndefined(jsonMetaPointer)) {
            throw new Error(
                `Cannot read json 2: not a Freon structure, classifier name missing: ${jsonAsString(node)}.`,
            );
        }
        const conceptMetaPointer = this.convertMetaPointer(jsonMetaPointer, node);
        // LOGGER.log(`Metapointer is ${jsonAsString(conceptMetaPointer)}`);
        const classifier = this.language.classifierByKey(conceptMetaPointer.key);
        if (isNullOrUndefined(classifier)) {
            LOGGER.error(`1 Cannot read json 3: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        const tsObject: FreNode = this.language.createConceptOrUnit(classifier.typeName, id);
        if (isNullOrUndefined(tsObject)) {
            LOGGER.error(`2 Cannot read json 4: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        // Store id, so it will not be used for new instances
        FreUtils.nodeIdProvider.usedId(tsObject.freId());
        const parsedLimiteds = this.convertPrimitiveProperties(tsObject, conceptMetaPointer.key, node);
        const parsedChildren = this.convertChildProperties(conceptMetaPointer.key, node);
        const parsedReferences = this.convertReferenceProperties(conceptMetaPointer.key, node);
        // LOGGER.info(`toTypeScriptInstanceInternal result ${jsonAsString({ freNode: tsObject, children: parsedChildren, references: parsedReferences })}`)
        return { freNode: tsObject, children: parsedChildren, references: parsedReferences.concat(parsedLimiteds) };
    }

    /**
     * Convert primitive property values and add value directly into the `freNode`.
     * Any limited values found will be returned in the list of `ParsedReference`s
     * @param freNode       Node being converted into.
     * @param concept       The Concept of the `freNode`.
     * @param jsonObject    The object being converted from.
     * @return              The parsed references for limited properties.
     * @private
     */
    private convertPrimitiveProperties(freNode: FreNode, concept: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const parsedLimiteds: ParsedReference[] = []
        const jsonProperties = jsonObject.properties;
        FreUtils.CHECK(
            Array.isArray(jsonProperties),
            "Found properties value which is not a Array for node: " + jsonObject.id,
        );
        for (const jsonProperty of jsonProperties) {
            // LOGGER.log(">> creating property "+ jsonAsString(jsonProperty) + " with value " + jsonProperty.value);
            const jsonMetaPointer = jsonProperty.property;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (property === undefined || property === null) {
                LOGGER.error(`NULL PROPERTY for key ${propertyMetaPointer.key} in concept ${concept}`);
            }
            if (isNullOrUndefined(property)) {
                // FIXME known prpblems
                if (propertyMetaPointer.key !== "qualifiedName") {
                    LOGGER.error("Unknown property: " + propertyMetaPointer.key + " for concept " + concept + "  ignored")
                }
                continue;
            }
            FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
            if (property.propertyKind !== "primitive") {
                console.error("Primitive value found for non primitive property: " + property.name)
                // continue
            }
            // console.log(`DESER prop '${property.name}': '${property.type}' value '${jsonProperty.value}'`)
            const propertyConcept = FreLanguage.getInstance().concept(property.type)
            // LIONWEB: Handle Limited references as primitive properties, because limited maps to Enumeration in LionWeb.
            if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                console.log(`DE-SERIALIZING LIMITED PROPERTY ${propertyConcept} for property ${property.name}`)
                parsedLimiteds.push({
                    featureName: property.name,
                    isList: property.isList,
                    typeName: property.type,
                    referredId: null,
                    resolveInfo: jsonProperty.value,
                });
                continue
            }

            const value = jsonProperty.value;
            if (isNullOrUndefined(value)) {
                if (property.isOptional) {
                    freNode[property.name] = undefined
                    continue
                } else {
                    LOGGER.error(`Property ${property.name} should have a value: ${jsonAsString(property, 2)} value is ${value}.`);
                }
            }
            if (property.type === "string" || property.type === "identifier") {
                let stringValue = value as string
                if (isNullOrUndefined(stringValue)) {
                    LOGGER.error(`String value for ${property.name} has is incorrect '${value}': initializing to empty string`)
                    stringValue = ""
                }
                freNode[property.name] = stringValue;
            } else if (property.type === "number") {
                let numberValue = Number.parseInt(value as string) 
                if (Number.isNaN(numberValue)) {
                    LOGGER.error(`Number value for ${property.name} has incorrect number format '${value}': initializing to 0`)
                    numberValue = 0 // default if the value is incorrect
                }
                freNode[property.name] = numberValue;
            } else if (property.type === "boolean") {
                if (value !== "true" && value !== "false")  {
                    LOGGER.error(`Boolean value for ${property.name} has incorrect boolean format '${value}': initializing to false`)
                }
                freNode[property.name] = value === "true";
            }
        }
        return parsedLimiteds
    }

    private convertMetaPointer(jsonObject: LionWebJsonMetaPointer, parent: Object): LionWebJsonMetaPointer {
        if (isNullOrUndefined(jsonObject)) {
            throw new Error(`Cannot read json 6: not a MetaPointer: ${jsonAsString(parent)}.`);
        }

        const language = jsonObject.language;
        if (isNullOrUndefined(language)) {
            throw new Error(`MetaPointer misses metamodel: ${jsonAsString(jsonObject)}`);
        }
        const version = jsonObject.version;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses version: ${jsonAsString(jsonObject)}`);
        }
        const key = jsonObject.key;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses key: ${jsonAsString(jsonObject)}`);
        }
        return {
            language: language,
            version: version,
            key: key,
        };
    }

    // TODO Check Parameter FreNode removed
    private convertChildProperties(concept: string, jsonObject: LionWebJsonNode): ParsedChild[] {
        const jsonChildren = jsonObject.containments;
        FreUtils.CHECK(
            Array.isArray(jsonChildren),
            "Found children value which is not a Array for node: " + jsonObject.id,
        );
        const parsedChildren: ParsedChild[] = [];
        for (const jsonChild of jsonChildren) {
            LOGGER.info(`convertChildProperties ${jsonAsString(jsonChild.containment)}`)
            const jsonMetaPointer = jsonChild.containment;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (isNullOrUndefined(property)) {
                LOGGER.log("Unknown child property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(
                property.propertyKind === "part",
                "Part value found for non part property: " + property.name,
            );
            const jsonValue = jsonChild.children;
            FreUtils.CHECK(
                Array.isArray(jsonValue),
                "Found child value which is not a Array for property: " + property.name,
            );
            for (const item of jsonValue as []) {
                if (notNullOrUndefined(item)) {
                    parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item });
                }
            }
        }
        LOGGER.info("convertChildProperties resuilt is " + jsonAsString(parsedChildren))
        return parsedChildren;
    }

    // TODO Check Parameter FreNode removed
    private convertReferenceProperties(concept: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const jsonReferences = jsonObject.references;
        FreUtils.CHECK(
            Array.isArray(jsonReferences),
            "Found references value which is not a Array for node: " + jsonObject.id,
        );
        const parsedReferences: ParsedReference[] = [];
        for (const jsonReference of jsonReferences) {
            LOGGER.info(`convertReferenceProperties ${jsonAsString(jsonReference.reference)}`)
            const jsonMetaPointer = jsonReference.reference;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (isNullOrUndefined(property)) {
                LOGGER.error("Unknown reference property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(
                property.propertyKind === "reference",
                "Reference value found for non reference property: " + property.name,
            );
            const jsonValue = jsonReference.targets;
            FreUtils.CHECK(
                Array.isArray(jsonValue),
                "Found targets value which is not a Array for property: " + property.name,
            );
            for (const item of jsonValue) {
                if (notNullOrUndefined(item)) {
                    if (typeof item === "object") {
                        const propertyConcept = FreLanguage.getInstance().concept(property.type)
                        // LIONWEB: Handle Limited references as primitive properties, because limited maps to Enumeration in LionWeb.
                        if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                            console.log(`WARNING DE-SERIALIZING LIMITED AS REFERENCE ${propertyConcept} for property ${property.name}`)
                            
                        }
                        // New reference format with resolveInfo
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item.reference,
                            resolveInfo: item.resolveInfo,
                        });
                    } else if (typeof item === "string") {
                        // OLD reference format, just an id
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item,
                            resolveInfo: "",
                        });
                    } else {
                        LOGGER.log("Incorrect reference format: " + jsonAsString(item));
                    }
                }
            }
        }
        return parsedReferences;
    }

    // private checkValueToType(value: any, shouldBeType: string, property: FreLanguageProperty) {
    //     if (typeof value !== shouldBeType) {
    //         throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
    //     }
    // }

    /**
     * Create JSON Object, storing references as names.
     */
    public convertToJSON(freNode: FreNode, publicOnly?: boolean): LionWebJsonNode[] {
        const typename = freNode.freLanguageConcept();
        LOGGER.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);

        const idMap = new Map<string, LionWebJsonNode>();
        // TODO untangle function convertToJSONinternal
        // @ts-expect-error error TS6133: 'root' is declared but its value is never read.
        let root: LionWebJsonNode;
        if (publicOnly !== undefined && publicOnly) {
            console.error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
            throw new Error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
        } else {
            root = this.convertToJSONinternal(freNode, idMap);
        }
        LOGGER.log("end converting concept name " + jsonAsString(Object.values(idMap)));
        return Object.values(idMap);
    }

    private convertToJSONinternal(
        freNode: FreNode,
        idToLionWebJsonNodeMap: Map<string, LionWebJsonNode>,
    ): LionWebJsonNode {
        let result = idToLionWebJsonNodeMap.get(freNode.freId());
        if (result !== undefined) {
            LOGGER.error("already found: " + freNode.freId());
            return result;
        }
        const typename = freNode.freLanguageConcept();
        result = createLionWebJsonNode();
        idToLionWebJsonNodeMap[freNode.freId()] = result;
        result.id = freNode.freId();
        result.parent = freNode?.freOwner()?.freId();
        if (result.parent === undefined || freNode.freIsUnit()) {
            result.parent = null;
        }

        let lionWebConceptKey: string;
        let lionWebLanguage: string;
        const concept = this.language.concept(typename);
        if (concept !== undefined) {
            lionWebConceptKey = concept.key;
            lionWebLanguage = concept.language;
        } else {
            // Should be a ModelUnit
            const unit = this.language.unit(typename);
            lionWebConceptKey = unit?.key;
            lionWebLanguage = unit?.language;
        }
        if (lionWebConceptKey === undefined) {
            LOGGER.error(`Unknown concept key: ${typename}`);
            return undefined;
        }
        result.classifier = this.createMetaPointer(lionWebConceptKey, lionWebLanguage);
        // LOGGER.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // LOGGER.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            this.convertPropertyToJSON(p, freNode, result, idToLionWebJsonNodeMap);
            // LOGGER.log("<<<< end converting property  " + p.name);
        }
        return result;
    }

    private createMetaPointer(key: string, language: string): LionWebJsonMetaPointer {
        // const result = {};
        return {
            language: language,
            // TODO hardcoded version, need to include language version in Freon proprely
            version: "2023.1",
            key: key,
        };
    }

    private convertPropertyToJSON(
        p: FreLanguageProperty,
        parentNode: FreNode,
        result: LionWebJsonNode,
        idMap: Map<string, LionWebJsonNode>,
    ) {
        // const typename = parentNode.freLanguageConcept();
        if (p.id === undefined) {
            LOGGER.log(`no id defined for property ${p.name}`);
            return;
        }
        switch (p.propertyKind) {
            case "part":
                const value = parentNode[p.name];
                if (value === null || value === undefined) {
                    LOGGER.log("PART is null: " + parentNode["name"] + "." + p.name);
                    break;
                }
                const child: LionWebJsonContainment = {
                    containment: this.createMetaPointer(p.key, p.language),
                    children: [],
                };
                if (p.isList) {
                    const parts: FreNode[] = parentNode[p.name];
                    for (const part of parts) {
                        child.children.push(this.convertToJSONinternal(part, idMap).id);
                    }
                } else {
                    // single value
                    child.children.push(
                        (!!value ? this.convertToJSONinternal(value as FreNode, idMap) : null).id,
                    );
                }
                result.containments.push(child);
                break;
            case "reference":
                const propertyConcept = FreLanguage.getInstance().concept(p.type) 
                // LIONWEB: Handle Limited references as primitive properties, because limited maps to Enumeration in LionWeb.
                if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                    console.log(`SERIALIZING LIMITED ${propertyConcept} for property ${p.name}`)
                    const limitedRefValue = parentNode[p.name];
                    if (p.isList) {
                        LOGGER.error(`Limited list is not supported by LionWeb, stored JSON will be incompatible with LionWeb.`)
                        // const limitedValue = (limitedRefValue as FreNodeReference<any>[])?.map(l => l.name)
                        // console.log(`   LIST limitedref   is ${(limitedRefValue as FreNodeReference<any>)?.name}`)
                        // console.log(`   limitedValue is ${limitedValue}`)
                        // console.log(`   metapointer ${p.key}, ${p.language}`)
                        // result.properties.push({
                        //     property: this.createMetaPointer(p.key, p.language),
                        //     value: propertyValueToString(limitedValue),
                        // })
                    } else {
                        const name = (limitedRefValue as FreNodeReference<any>)?.name
                        console.log(`   limitedref for property ${p.name}  is ${name}`)
                        console.log(`   metapointer ${p.key}, ${p.language}`)
                        result.properties.push({
                            property: this.createMetaPointer(p.key, p.language),
                            value: propertyValueToString(name),
                        })
                        return
                    }
                }
                const lwReference: LionWebJsonReference = {
                    reference: this.createMetaPointer(p.key, p.language),
                    targets: [],
                };
                if (p.isList) {
                    const references: FreNodeReference<FreNamedNode>[] = parentNode[p.name];
                    LOGGER.log("References for " + p.name + ": " + references);
                    for (const ref of references) {
                        if (ref === null || ref === undefined) {
                            LOGGER.log("REF NULL for " + p.name);
                            break;
                        }
                        const referredId = ref?.referred?.freId();
                        if (!!ref.name || !!referredId) {
                            lwReference.targets.push({
                                resolveInfo: ref.name,
                                reference: referredId ?? null,
                            });
                        }
                    }
                } else {
                    // single reference
                    const ref: FreNodeReference<FreNamedNode> = parentNode[p.name];
                    if (ref === null || ref === undefined) {
                        LOGGER.log("REF NULL for " + p.name + " parant " + parentNode["name"]);
                        break;
                    }
                    const referredId = ref?.referred?.freId();
                    if (!!ref.name || !!referredId) {
                        const referenceProp = ref?.referred?.freId();
                        lwReference.targets.push({
                            resolveInfo: !!ref ? ref["name"] : null,
                            reference: referenceProp ?? null,
                        });
                    }
                }
                result.references.push(lwReference);
                break;
            case "primitive":
                const value2 = parentNode[p.name];
                result.properties.push({
                    property: this.createMetaPointer(p.key, p.language),
                    value: propertyValueToString(value2),
                });
                break;
            default:
                break;
        }
    }
}

function propertyValueToString(value: any): string {
    switch (typeof value) {
        case "string":
            return value;
        case "boolean":
            return value === true ? "true" : "false";
        case "number":
            return "" + value;
        default:
            return value;
    }
}
