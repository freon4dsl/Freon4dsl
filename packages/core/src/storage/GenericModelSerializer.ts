import { PiElement } from "../language";
import { Language, Property } from "./Language";
import { isNullOrUndefined } from "../util";

/**
 * Helper class to serialize a model using MobXModelElementImpl.
 * Will take care of model references.
 *
 * Depends on private keys etc. as defined in MobXModelElement decorators.
 */
export class GenericModelSerializer {
    private language: Language;

    constructor() {
        this.language = Language.getInstance();
    }

    /**
     * Convert a JSON object formerly JSON-ified by this very class and turn it into
     * a TypeScript object (being an instance of TypeScript class).
     * Works recursively.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): any {
        return this.toTypeScriptInstanceInternal(jsonObject);
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): any {
        if (jsonObject === null) {
            throw new Error("jsonObject is null, cannot convert to TypeScript");
        }
        const type: string = jsonObject["$typename"];
        if (isNullOrUndefined(type)) {
            throw new Error(`Cannot read json: not a ProjectIt structure.`);
        }
        const result: PiElement = this.language.createConceptOrUnit(type);
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

    private convertProperties(result: PiElement, property: Property, value: any) {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyType + " isList " + property.isList);
        switch (property.propertyType) {
            case "primitive":
                if (property.isList) {
                    result[property.name] = [];
                    for (const item in value) {
                        result[property.name].push(value[item]);
                    }
                } else {
                    // TODO Add other primitive property types
                    if (typeof value === "string") {
                        result[property.name] = value;
                    } else if (typeof value === "number") {
                        result[property.name] = value;
                    } else if (typeof value === "boolean") {
                        result[property.name] = value;
                    }
                }
                break;
            case "part":
                if (property.isList) {
                    // console.log("    list property of size "+ value.length);
                    // result[property.name] = [];
                    for (const item in value) {
                        result[property.name].push(this.toTypeScriptInstance(value[item]));
                    }
                } else {
                    result[property.name] = this.toTypeScriptInstance(value);
                }
                break;
            case "reference":
                if (property.isList) {
                    for (const item in value) {
                        result[property.name].push(this.language.referenceCreator(value[item], property.type));
                    }
                } else {
                    result[property.name] = this.language.referenceCreator(value, property.type);
                }
                break;
            default:
        }
    }
    /**
     * Create JSON Object, storing references as names.
     */
    convertToJSON(tsObject: PiElement, publicOnly?: boolean): Object {
        const typename = tsObject.piLanguageConcept();
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
        // console.log("end converting concept name " + tsObject.piLanguageConcept());
        return result;
    }

    private convertToJSONinternal(tsObject: PiElement, publicOnly: boolean, typename: string): Object {
        const result: Object = { $typename: typename };
        // console.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // console.log(">>>> start converting property " + p.name + " of type " + p.propertyType);
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

    private convertPropertyToJSON(p: Property, tsObject: PiElement, publicOnly: boolean, result: Object) {
        switch (p.propertyType) {
            case "part":
                const value = tsObject[p.name];
                if (p.isList) {
                    const parts: Object[] = tsObject[p.name];
                    result[p.name] = [];
                    for (let i: number = 0; i < parts.length; i++) {
                        result[p.name][i] = this.convertToJSON(parts[i] as PiElement, publicOnly);
                    }
                } else {
                    // single value
                    result[p.name] = !!value ? this.convertToJSON(value as PiElement, publicOnly) : null;
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
            // case "enumeration": // TODO remove enumeration from Serializer
            //     var value = tsObject[p.name];
            //     if (p.isList) {
            //         const literals: Object[] = tsObject[p.name];
            //         result[p.name] = [];
            //         for (var i: number = 0; i < literals.length; i++) {
            //             result[p.name][i] = literals[i]["name"];
            //         }
            //     } else {
            //         // single value
            //         result[p.name] = value["name"];
            //     }
            //     break;
            case "primitive":
                const value2 = tsObject[p.name];
                if (typeof value2 === "string") {
                    result[p.name] = value2;
                } else if (typeof value2 === "number") {
                    result[p.name] = value2;
                } else if (typeof value2 === "boolean") {
                    result[p.name] = value2;
                }
                break;
            default:
                break;
        }
    }
}
