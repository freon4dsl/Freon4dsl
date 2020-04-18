import { PiElement } from "../language/PiModel";
import { Language } from "./Language";

// const MODEL_TYPE = "$typename";


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
        const result: any = this.toTypeScriptInstanceInternal(jsonObject);
        return result;
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): any {
        const type: string = jsonObject["$typename"];

        const result = this.language.createConcept(type);
        // console.log("Object created with [" + type + "]");

        for (let property of this.language.allConceptProperties(type)) {
            const value = jsonObject[property.name];
            if (value === undefined) {
                continue;
            }
            // console.log(">> creating property "+ property.name + "  of type " + property.propertyType + " isLis " + property.isList);
            switch (property.propertyType) {
                case "primitive":
                    if (property.isList) {
                        result[property.name] = [];
                        for (var item in value) {
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
                case "enumeration":
                    if (property.isList) {
                        for (var item in value) {
                            result[property.name].push(value[item]);
                        }
                    } else {
                        result[property.name] = value;
                    }
                    break;
                case "part":
                    if (property.isList) {
                        // console.log("    list property of size "+ value.length);
                        // result[property.name] = [];
                        for (var item in value) {
                            result[property.name].push(this.toTypeScriptInstance(value[item]));
                        }
                    } else {
                        result[property.name] = this.toTypeScriptInstance(value);
                    }
                    break;
                case "reference":
                    if (property.isList) {
                        for (var item in value) {
                            result[property.name].push(value[item]["name"]);
                        }
                    } else {
                        console.log("Serializer creating property " + property.name + "  referene [" + value + "] to a [" + property.type+ "]")
                        result[property.name] = this.language.referenceCreator(value[item], property.type);
                    }
                    break;
                default:
            }
        }
        return result;
    }

    /**
     * Create JSON Object, storing references as names.
     */
    convertToJSON(tsObject: PiElement): Object {
        const typename = tsObject.piLanguageConcept();
        // console.log("start converting concept name " + typename);
        var result: Object = { "$typename": typename };
        for (let p of this.language.allConceptProperties(typename)) {
            // console.log(">>>> start converting property " + p.name + " of type " + p.propertyType);
            switch (p.propertyType) {
                case "part":
                    var value = tsObject[p.name];
                    if (p.isList) {
                        const parts: Object[] = tsObject[p.name];
                        result[p.name] = [];
                        for (var i: number = 0; i < parts.length; i++) {
                            result[p.name][i] = this.convertToJSON(parts[i] as PiElement);
                        }
                    } else {
                        // single value
                        result[p.name] = this.convertToJSON(value as PiElement);
                    }
                    break;
                case "reference":
                    if (p.isList) {
                        const references: Object[] = tsObject[p.name];
                        result[p.name] = [];
                        for (var i: number = 0; i < references.length; i++) {
                            result[p.name][i] = references[i]["name"];
                        }
                    } else {
                        // single reference
                        const value = tsObject[p.name];
                        result[p.name] = (!!value ? tsObject[p.name]["name"] : null );
                    }
                    break;
                case "enumeration":
                    var value = tsObject[p.name];
                    if (p.isList) {
                        const literals: Object[] = tsObject[p.name];
                        result[p.name] = [];
                        for (var i: number = 0; i < literals.length; i++) {
                            result[p.name][i] = literals[i]["name"];
                        }
                    } else {
                        // single value
                        result[p.name] = value["name"];
                    }
                    break;
                case "primitive":
                    var value = tsObject[p.name];
                    if (typeof value === "string") {
                        result[p.name] = value;
                    } else if (typeof value === "number") {
                        result[p.name] = value;
                    } else if (typeof value === "boolean") {
                        result[p.name] = value;
                    }
                    break;
                default:
                    break;
            }
            // console.log("<<<< end converting property  " + p.name);
        }
        // console.log("end converting concept name " + tsObject.piLanguageConcept());
        return result;
    }
}

