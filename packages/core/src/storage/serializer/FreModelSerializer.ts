import { FreNode } from "../../ast/index";
import { FreLanguage, FreLanguageProperty } from "../../language/index";
import { isNullOrUndefined } from "../../util/index";
import { FreSerializer } from "./FreSerializer";

/**
 * Helper class to serialize a model using MobXModelElementImpl.
 * Will take care of model references.
 *
 * Depends on private keys etc. as defined in MobXModelElement decorators.
 */
export class FreModelSerializer implements FreSerializer {
    private language: FreLanguage;

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
    public toTypeScriptInstance(jsonObject: Object): FreNode {
        return this.toTypeScriptInstanceInternal(jsonObject);
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): FreNode {
        if (jsonObject === null) {
            throw new Error("Cannot read json: jsonObject is null.");
        }
        const type: string = jsonObject["$typename"];
        if (isNullOrUndefined(type)) {
            throw new Error(
                `Cannot read json: not a Freon structure, typename missing: ${JSON.stringify(jsonObject)}.`,
            );
        }
        const result: FreNode = this.language.createConceptOrUnit(type);
        if (isNullOrUndefined(result)) {
            throw new Error(`Cannot read json: ${type} unknown.`);
        }
        for (const property of this.language.allConceptProperties(type)) {
            const value = jsonObject[property.name];
            if (isNullOrUndefined(value)) {
                continue;
                // TODO how to report this to the user..?
            }
            this.convertProperties(result, property, value);
        }
        return result;
    }

    private convertProperties(result: FreNode, property: FreLanguageProperty, value: any) {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyKind + " isList " + property.isList);
        switch (property.propertyKind) {
            case "primitive":
                if (property.isList) {
                    result[property.name] = [];
                    for (const item in value) {
                        result[property.name].push(value[item]);
                    }
                } else {
                    if (property.type === "string" || property.type === "identifier") {
                        this.checkValueToType(value, "string", property);
                    } else if (property.type === "number") {
                        this.checkValueToType(value, "number", property);
                    } else if (property.type === "boolean") {
                        this.checkValueToType(value, "boolean", property);
                    }
                    result[property.name] = value;
                }
                break;
            case "part":
                if (property.isList) {
                    // console.log("    list property of size "+ value.length);
                    // result[property.name] = [];
                    for (const item in value) {
                        if (!isNullOrUndefined(value[item])) {
                            result[property.name].push(this.toTypeScriptInstance(value[item]));
                        }
                    }
                } else {
                    if (!isNullOrUndefined(value)) {
                        result[property.name] = this.toTypeScriptInstance(value);
                    }
                }
                break;
            case "reference":
                if (property.isList) {
                    for (const item in value) {
                        if (!isNullOrUndefined(value[item])) {
                            result[property.name].push(this.language.referenceCreator(value[item], property.type));
                        }
                    }
                } else {
                    if (!isNullOrUndefined(value)) {
                        result[property.name] = this.language.referenceCreator(value, property.type);
                    }
                }
                break;
            default:
        }
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
