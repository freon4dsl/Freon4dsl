import type { LionWebJsonChunk, LionWebJsonContainment, LionWebJsonMetaPointer, LionWebJsonNode, LionWebJsonReference } from "@lionweb/json";
import { runInAction } from "mobx";
import type { FreNamedNode, FreNode } from "../../ast/index.js";
import { FreNodeReference } from "../../ast/index.js";
import { FREON } from "../../environment/index.js"
import { FreLanguage, type FreLanguageClassifier, type FreLanguageConcept } from "../../language/index.js"
import type { FreLanguageProperty } from "../../language/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils, isNullOrUndefined, jsonAsString, notNullOrUndefined } from '../../util/index.js';
import type { FreSerializer } from "./FreSerializer.js"
import { createLionWebJsonNode, isLionWebJsonChunk, LanguageVersion, SerializationFormatVersion, collectUsedLanguages } from "../utils/index.js"
import type { LionWebJsonProperty } from "@lionweb/server-delta-shared"

/*
At a high level, the class does two opposite jobs:

FreNode → LionWeb JSON
LionWeb JSON → FreNode

The deserialization flow is:

    deserializeChunk()
        ↓
    toTypeScriptInstanceInternal() for every JSON node
        ↓
    store ParsedNode objects in nodesfromJson
        ↓
    resolveChildrenAndReferences()
        ↓
    findRoot()

The serialization flow is:

    convertToLionWebChunk()
        ↓
    convertToJSON()
        ↓
    convertToJSONinternal()
        ↓
    convertPropertyToJSON()
 */

const LOGGER = new FreLogger("FreLionwebSerializer");
/**
 * Helper types for nodes parsed from a LionWeb JSON.
 */
type ParsedChild = {
    featureName: string;
    isList: boolean;
    referredId: string;
};
type ParsedReference = {
    featureName: string;
    isList: boolean;
    typeName?: string;
    referredId: string | null;
    resolveInfo: string;
};
type ParsedNode = {
    parentId: string | null
    freNode: FreNode;
    children: ParsedChild[];
    references: ParsedReference[];
};

export class FreLionwebSerializer implements FreSerializer {
    private get language(): FreLanguage {
        return FreLanguage.getInstance()
    }
    private nodesfromJson: Map<string, ParsedNode> = new Map<string, ParsedNode>()

    private static theInstance
    static getInstance(): FreLionwebSerializer {
        if (FreLionwebSerializer.theInstance === undefined) {
            FreLionwebSerializer.theInstance = new FreLionwebSerializer()
        }
        return FreLionwebSerializer.theInstance
    }

    constructor() {}

    /**
     * Convert a LionWeb JSON chunk into FreNode instances.
     *
     * First all nodes are created without their containments and references.
     * Afterwards, containments and references are resolved, and the appropriate
     * root node is returned.
     *
     * @param jsonObject the LionWeb JSON chunk to deserialize
     * @param parentId optional ID of the node that should own the returned root
     */
    deserializeChunk(jsonObject: object, parentId?: string | null): FreNode | null {
        LOGGER.log("deserializeChunk")
        this.nodesfromJson.clear()

        if (!isLionWebJsonChunk(jsonObject)) {
            LOGGER.error("Cannot read JSON: object is not a LionWeb chunk.")
            throw new Error("Cannot read JSON: object is not a LionWeb chunk.")
        }

        LOGGER.log("SerializationFormatVersion: " + jsonObject.serializationFormatVersion)

        // Not using FREON.astChanger.change(...) here because this operation
        // should not be recorded for undo.
        runInAction(() => {
            // First create all nodes without resolving containments or references.
            for (const node of jsonObject.nodes) {
                const parsedNode = this.toTypeScriptInstanceInternal(node)

                if (parsedNode !== null) {
                    this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode)
                }
            }

            LOGGER.info("resolving children and references")
            this.resolveChildrenAndReferences()
            LOGGER.info("resolved children and references")
        })

        const root = this.findRoot(parentId)

        LOGGER.log("deserializeChunk done with root")
        LOGGER.log("deserializeChunk " + root?.freLanguageConcept())

        return root
    }

    /**
     * Return the first model unit encountered.
     * If `parentId` is supplied, return the first node whose parent has that ID.
     * If `parentId` is absent, return the first node without a parent.
     *
     * @param parentId
     * @private
     */
    private findRoot(parentId?: string | null): FreNode | null {
        // First search for a model unit or a node whose parent has the requested ID.
        for (const parsedNode of this.nodesfromJson.values()) {
            if (parsedNode.freNode.freIsUnit()) {
                return parsedNode.freNode
            } else if (notNullOrUndefined(parentId) && parsedNode.parentId === parentId) {
                return parsedNode.freNode
            }
        }

        // If no parentId was requested, search for a node without a parent.
        if (isNullOrUndefined(parentId)) {
            for (const parsedNode of this.nodesfromJson.values()) {
                if (isNullOrUndefined(parsedNode.parentId)) {
                    return parsedNode.freNode
                }
            }
        }

        return null
    }

    /**
     * Resolve the containments and references of all parsed nodes.
     *
     * During the first deserialization phase, FreNode instances are created
     * without connecting their children or references. This method performs
     * that second phase by linking child nodes from `nodesfromJson` and by
     * creating the corresponding FreNodeReference instances.
     *
     * Children that cannot be found in the parsed node map are logged and ignored.
     */
    private resolveChildrenAndReferences(): void {
        for (const parsedNode of this.nodesfromJson.values()) {
            LOGGER.log(`Resolving children and references for node ${parsedNode.freNode.freId()}`)

            for (const child of parsedNode.children) {
                const resolvedChild = this.nodesfromJson.get(child.referredId)

                if (isNullOrUndefined(resolvedChild)) {
                    LOGGER.error(`Child cannot be resolved: ${child.referredId}`)
                    continue
                }

                if (child.isList) {
                    parsedNode.freNode[child.featureName].push(resolvedChild.freNode)
                } else {
                    parsedNode.freNode[child.featureName] = resolvedChild.freNode
                }
            }

            for (const reference of parsedNode.references) {
                const freonRef = FreNodeReference.createFromLionWeb<FreNamedNode>(reference.resolveInfo, reference.referredId, reference.typeName)

                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef)
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef
                }
            }
        }
    }

    /**
     * Create a FreNode for one LionWeb JSON node.
     *
     * Primitive properties are assigned immediately. Containments and references
     * are collected and resolved later, after all FreNode instances have been
     * created.
     *
     * @param node the LionWeb JSON node to deserialize
     * @returns the partially resolved node, or null if its classifier is unknown
     */
    private toTypeScriptInstanceInternal(node: LionWebJsonNode): ParsedNode | null {
        LOGGER.info(`Creating FreNode for LionWeb node ${node.id}`)

        const classifierPointer: LionWebJsonMetaPointer = node.classifier

        if (isNullOrUndefined(classifierPointer)) {
            throw new Error(`Cannot deserialize LionWeb node ${node.id}: classifier is missing.`)
        }

        const conceptPointer: LionWebJsonMetaPointer = this.validateMetaPointer(classifierPointer, node)
        const classifier: FreLanguageClassifier = this.language.classifierByKey(conceptPointer.key)

        if (isNullOrUndefined(classifier)) {
            LOGGER.error(`Cannot deserialize LionWeb node ${node.id}: ` + `classifier key '${conceptPointer.key}' is unknown.`)
            return null
        }

        const freNode: FreNode = this.language.createConceptOrUnit(classifier.typeName, node.id)

        if (isNullOrUndefined(freNode)) {
            LOGGER.error(`Cannot create FreNode for classifier '${classifier.typeName}' ` + `and LionWeb node ${node.id}.`)
            return null
        }

        FREON.idProvider.usedId(freNode.freId())

        const limitedReferences = this.deserializePrimitiveProperties(freNode, conceptPointer.key, node)
        const children = this.deserializeContainments(conceptPointer.key, node)
        const references = this.deserializeReferences(conceptPointer.key, node)

        return {
            parentId: node.parent,
            freNode,
            children,
            references: references.concat(limitedReferences),
        }
    }

    /**
     * Convert primitive property values and add value directly into the `freNode`.
     * Any limited values found will be returned in the list of `ParsedReference`s
     * @param freNode       Node being converted into.
     * @param classifierKey       The Concept of the `freNode`.
     * @param jsonObject    The object being converted from.
     * @return              The parsed references for limited properties.
     * @private
     */
    private deserializePrimitiveProperties(freNode: FreNode, classifierKey: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const parsedLimiteds: ParsedReference[] = []
        const jsonProperties: LionWebJsonProperty[] = jsonObject.properties

        FreUtils.CHECK(Array.isArray(jsonProperties), `Found properties value which is not an array for node ${jsonObject.id}`)

        for (const jsonProperty of jsonProperties) {
            const propertyMetaPointer: LionWebJsonMetaPointer = this.validateMetaPointer(jsonProperty.property, jsonObject)

            const property: FreLanguageProperty | undefined = this.language.classifierPropertyByKey(classifierKey, propertyMetaPointer.key)

            if (isNullOrUndefined(property)) {
                if (propertyMetaPointer.key !== "qualifiedName") {
                    LOGGER.error(`Unknown property '${propertyMetaPointer.key}' ` + `for classifier '${classifierKey}'; property ignored.`)
                }
                continue
            }

            FreUtils.CHECK(!property.isList, `LionWeb does not support list properties: ${property.name}`)

            const propertyConcept: FreLanguageConcept | undefined = this.language.concept(property.type)

            // Limited concepts are represented as LionWeb enumeration properties.
            // Resolve the stored value later as a FreNodeReference.
            if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                if (notNullOrUndefined(jsonProperty.value)) {
                    parsedLimiteds.push({
                        featureName: property.name,
                        isList: property.isList,
                        typeName: property.type,
                        referredId: null, // intentionally null; a limited value is identified through resolveInfo, not through a node ID
                        resolveInfo: jsonProperty.value,
                    })
                }

                continue
            }

            const lionWebValue: String | null = jsonProperty.value

            if (isNullOrUndefined(lionWebValue)) {
                if (property.isOptional) {
                    freNode[property.name] = undefined
                } else {
                    LOGGER.error(`Required property '${property.name}' has no value; ` + `using its default value.`)

                    if (property.type === "string" || property.type === "identifier") {
                        freNode[property.name] = ""
                    } else if (property.type === "number") {
                        freNode[property.name] = 0
                    } else if (property.type === "boolean") {
                        freNode[property.name] = false
                    }
                }

                continue
            }
            // At this point, lionWebValue is non-null; normalize it to a primitive string.
            const value: string = lionWebValue.valueOf()

            if (property.type === "string" || property.type === "identifier") {
                freNode[property.name] = value
            } else if (property.type === "number") {
                const numberValue = Number(value)

                if (Number.isNaN(numberValue)) {
                    LOGGER.error(`Number value for '${property.name}' has incorrect format ` + `'${value}'; initializing to 0.`)
                    freNode[property.name] = 0
                } else {
                    freNode[property.name] = numberValue
                }
            } else if (property.type === "boolean") {
                if (value !== "true" && value !== "false") {
                    LOGGER.error(`Boolean value for '${property.name}' has incorrect format ` + `'${value}'; initializing to false.`)
                }

                freNode[property.name] = value === "true"
            }
        }
        return parsedLimiteds
    }

    /**
     * Validate and copy a LionWeb meta-pointer.
     *
     * Ensures that the language, version, and key are present before returning
     * a new meta-pointer object. The containing object is used only to provide
     * context when the meta-pointer itself is missing.
     *
     * @param metaPointer the LionWeb meta-pointer to validate
     * @param containingObject the object containing the meta-pointer
     * @returns a validated LionWeb meta-pointer
     * @throws if the meta-pointer or one of its required fields is missing
     */
    private validateMetaPointer(metaPointer: LionWebJsonMetaPointer, containingObject: object): LionWebJsonMetaPointer {
        if (isNullOrUndefined(metaPointer)) {
            throw new Error(`Cannot read json 6: not a MetaPointer: ${jsonAsString(containingObject)}.`)
        }

        const language = metaPointer.language
        if (isNullOrUndefined(language)) {
            throw new Error(`MetaPointer misses metamodel: ${jsonAsString(metaPointer)}`)
        }
        const version = metaPointer.version
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses version: ${jsonAsString(metaPointer)}`)
        }
        const key = metaPointer.key
        if (isNullOrUndefined(key)) {
            throw new Error(`MetaPointer misses key: ${jsonAsString(metaPointer)}`)
        }
        return {
            language: language,
            version: version,
            key: key,
        }
    }

    // TODO Check Parameter FreNode removed
    private deserializeContainments(concept: string, jsonObject: LionWebJsonNode): ParsedChild[] {
        const jsonChildren = jsonObject.containments
        FreUtils.CHECK(Array.isArray(jsonChildren), "Found children value which is not a Array for node: " + jsonObject.id)
        const parsedChildren: ParsedChild[] = []
        for (const jsonChild of jsonChildren) {
            LOGGER.info(`convertChildProperties ${jsonAsString(jsonChild.containment)}`)
            const jsonMetaPointer = jsonChild.containment
            const propertyMetaPointer = this.validateMetaPointer(jsonMetaPointer, jsonObject)
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(concept, propertyMetaPointer.key)
            if (isNullOrUndefined(property)) {
                LOGGER.log("Unknown child property: " + propertyMetaPointer.key + " for concept " + concept)
                continue
            }
            FreUtils.CHECK(property.propertyKind === "part", "Part value found for non part property: " + property.name)
            const jsonValue = jsonChild.children
            FreUtils.CHECK(Array.isArray(jsonValue), "Found child value which is not a Array for property: " + property.name)
            for (const item of jsonValue as []) {
                if (notNullOrUndefined(item)) {
                    parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item })
                }
            }
        }
        LOGGER.info("convertChildProperties resuilt is " + jsonAsString(parsedChildren))
        return parsedChildren
    }

    // TODO Check Parameter FreNode removed
    private deserializeReferences(concept: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const jsonReferences = jsonObject.references
        FreUtils.CHECK(Array.isArray(jsonReferences), "Found references value which is not a Array for node: " + jsonObject.id)
        const parsedReferences: ParsedReference[] = []
        for (const jsonReference of jsonReferences) {
            LOGGER.info(`deserializeReferences ${jsonAsString(jsonReference.reference)}`)
            const jsonMetaPointer = jsonReference.reference
            const propertyMetaPointer = this.validateMetaPointer(jsonMetaPointer, jsonObject)
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(concept, propertyMetaPointer.key)
            if (isNullOrUndefined(property)) {
                LOGGER.error("Unknown reference property: " + propertyMetaPointer.key + " for concept " + concept)
                continue
            }
            FreUtils.CHECK(property.propertyKind === "reference", "Reference value found for non reference property: " + property.name)
            const jsonValue = jsonReference.targets
            FreUtils.CHECK(Array.isArray(jsonValue), "Found targets value which is not a Array for property: " + property.name)
            for (const item of jsonValue) {
                if (notNullOrUndefined(item)) {
                    if (typeof item === "object") {
                        const propertyConcept = this.language.concept(property.type)
                        // LIONWEB: Handle Limited references as primitive properties, because limited maps to Enumeration in LionWeb.
                        if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                            // LOGGER.log(`WARNING DE-SERIALIZING LIMITED AS REFERENCE ${propertyConcept} for property ${property.name}`)
                        }
                        // New reference format with resolveInfo
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item.reference,
                            resolveInfo: item.resolveInfo,
                        })
                    } else if (typeof item === "string") {
                        // OLD reference format, just an id
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item,
                            resolveInfo: "",
                        })
                    } else {
                        LOGGER.log("Incorrect reference format: " + jsonAsString(item))
                    }
                }
            }
        }
        return parsedReferences
    }

    // private checkValueToType(value: any, shouldBeType: string, property: FreLanguageProperty) {
    //     if (typeof value !== shouldBeType) {
    //         throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
    //     }
    // }

    /**
     * Because conversion to TypeScript nodes expects a LionWebChunk as input, this method converts
     * a single FreNode to such a chunk.
     * @param freNode the node to be transformed to JSON
     * @param publicOnly indicate whether private child nodes should be included
     */
    public convertToLionWebChunk(freNode: FreNode, publicOnly?: boolean): LionWebJsonChunk {
        const jsonUnit = this.convertToJSON(freNode, publicOnly)
        const output: LionWebJsonChunk = {
            serializationFormatVersion: SerializationFormatVersion,
            languages: collectUsedLanguages(jsonUnit),
            nodes: jsonUnit,
        }
        return output
    }

    /**
     * Create JSON Object, storing references as names.
     * @param freNode the node to be transformed to JSON
     * @param publicOnly indicate whether private child nodes should be included
     */
    public convertToJSON(freNode: FreNode, publicOnly?: boolean): LionWebJsonNode[] {
        const typename = freNode.freLanguageConcept()
        LOGGER.log("start converting concept name " + typename + ", publicOnly: " + publicOnly)

        const idMap = new Map<string, LionWebJsonNode>()
        // TODO untangle function convertToJSONinternal
        // @ts-expect-error error TS6133: 'root' is declared but its value is never read.
        let root: LionWebJsonNode
        if (publicOnly !== undefined && publicOnly) {
            LOGGER.error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
            throw new Error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
        } else {
            root = this.convertToJSONinternal(freNode, idMap)
        }
        LOGGER.log("end converting concept name " + jsonAsString(Object.values(idMap)))
        return Object.values(idMap)
    }

    private convertToJSONinternal(freNode: FreNode, idToLionWebJsonNodeMap: Map<string, LionWebJsonNode>): LionWebJsonNode {
        let result = idToLionWebJsonNodeMap.get(freNode.freId())
        if (result !== undefined) {
            LOGGER.error("already found: " + freNode.freId())
            return result
        }
        const typename = freNode.freLanguageConcept()
        result = createLionWebJsonNode()
        idToLionWebJsonNodeMap[freNode.freId()] = result
        result.id = freNode.freId()
        result.parent = freNode?.freOwner()?.freId()
        if (result.parent === undefined || freNode.freIsUnit()) {
            result.parent = null
        }

        let lionWebConceptKey: string
        let lionWebLanguage: string
        const concept = this.language.concept(typename)
        if (concept !== undefined) {
            lionWebConceptKey = concept.key
            lionWebLanguage = concept.language
        } else {
            // Should be a ModelUnit
            const unit = this.language.unit(typename)
            lionWebConceptKey = unit?.key
            lionWebLanguage = unit?.language
        }
        if (lionWebConceptKey === undefined) {
            LOGGER.error(`Unknown concept key: ${typename}`)
            return undefined
        }
        result.classifier = this.createMetaPointer(lionWebConceptKey, lionWebLanguage)
        // LOGGER.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // LOGGER.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            this.convertPropertyToJSON(p, freNode, result, idToLionWebJsonNodeMap)
            // LOGGER.log("<<<< end converting property  " + p.name);
        }
        return result
    }

    private createMetaPointer(key: string, language: string): LionWebJsonMetaPointer {
        // const result = {};
        return {
            language: language,
            // TODO hardcoded version, need to include language version in Freon proprely
            version: LanguageVersion,
            key: key,
        }
    }

    private convertPropertyToJSON(p: FreLanguageProperty, parentNode: FreNode, result: LionWebJsonNode, idMap: Map<string, LionWebJsonNode>) {
        // const typename = parentNode.freLanguageConcept();
        if (p.id === undefined) {
            LOGGER.log(`no id defined for property ${p.name}`)
            return
        }
        switch (p.propertyKind) {
            case "part": {
                const value = parentNode[p.name]
                if (value === null || value === undefined) {
                    LOGGER.log("PART is null: " + parentNode["name"] + "." + p.name)
                    break
                }
                const child: LionWebJsonContainment = {
                    containment: this.createMetaPointer(p.key, p.language),
                    children: [],
                }
                if (p.isList) {
                    const parts: FreNode[] = parentNode[p.name]
                    for (const part of parts) {
                        child.children.push(this.convertToJSONinternal(part, idMap).id)
                    }
                } else {
                    // single value
                    child.children.push((notNullOrUndefined(value) ? this.convertToJSONinternal(value as FreNode, idMap) : null).id)
                }
                result.containments.push(child)
                break
            }
            case "reference": {
                const propertyConcept = this.language.concept(p.type)
                // LIONWEB: Handle Limited references as primitive properties, because limited maps to Enumeration in LionWeb.
                if (notNullOrUndefined(propertyConcept) && propertyConcept.isLimited) {
                    // LOGGER.log(`SERIALIZING LIMITED ${propertyConcept} for property ${p.name}`)
                    const limitedRefValue = parentNode[p.name]
                    if (p.isList) {
                        LOGGER.error(`Limited list is not supported by LionWeb, stored JSON will be incompatible with LionWeb.`)
                    } else {
                        const name = (limitedRefValue as FreNodeReference<never>)?.name
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
                }
                if (p.isList) {
                    const references: FreNodeReference<FreNamedNode>[] = parentNode[p.name]
                    LOGGER.log("References for " + p.name + ": " + references)
                    for (const ref of references) {
                        if (ref === null || ref === undefined) {
                            LOGGER.log("REF NULL for " + p.name)
                            break
                        }
                        const referredId = ref?.referred?.freId()
                        if (!!ref.name || !!referredId) {
                            lwReference.targets.push({
                                resolveInfo: ref.name,
                                reference: referredId ?? null,
                            })
                        }
                    }
                } else {
                    // single reference
                    const ref: FreNodeReference<FreNamedNode> = parentNode[p.name]
                    if (ref === null || ref === undefined) {
                        LOGGER.log("REF NULL for " + p.name + " parant " + parentNode["name"])
                        break
                    }
                    const referredId = ref?.referred?.freId()
                    if (notNullOrUndefined(ref.name) || notNullOrUndefined(referredId)) {
                        const referenceProp = ref?.referred?.freId()
                        lwReference.targets.push({
                            resolveInfo: notNullOrUndefined(ref) ? ref["name"] : null,
                            reference: referenceProp ?? null,
                        })
                    }
                }
                result.references.push(lwReference)
                break
            }
            case "primitive": {
                const value2 = parentNode[p.name]
                result.properties.push({
                    property: this.createMetaPointer(p.key, p.language),
                    value: propertyValueToString(value2),
                })
                break
            }
            default:
                break
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
            return value ?? null;
    }
}
