// TODO Is only used in demo package, should be replaced by GenericModelSerializer
import { Checker } from "awesome-typescript-loader/dist/checker";
import { MODEL_PREFIX, MODEL_PREFIX_LENGTH } from "../language/decorators/MobxModelDecorators";
import { DecoratedModelElement, MobxModelElementImpl } from "../language/decorators/DecoratedModelElement";
import { ModelInfo } from "../language/decorators/ModelInfo";

type Constructors = { [name: string]: Function };

const MODEL_ID = MODEL_PREFIX + "_SERIAL_ID";
const MODEL_TYPE = "$typename";

/**
 * Helper class to serialize a model using MobXModelElementImpl.
 * Will take care of model references.
 *
 * Depends on private keys etc. as defined in MobXModelElement decorators.
 */
export class ModelSerializer {
    private identification: number = 1;
    private constructors: Constructors;

    constructor(constructors: Constructors) {
        this.constructors = constructors;
    }

    //////////////////////////////////////////////////////////////////
    //
    //  JSON to TypeScript conversion
    //
    /////////////////////////////////////////////////////////////////

    private revivedTypeScriptObjects: Map<string, Object> = new Map<string, Object>();
    private unresolvedReferences: { object: Object; key: string }[] = [];

    /**
     * Convert a JSON object formerly JSON-ified by this very class and turn it into
     * a TypeScript object (being an instance of TypeScript class).
     * Works recursively.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): any {
        const result: any = this.toTypeScriptInstanceInternal(jsonObject);
        this.resolveRefs();
        return result;
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): any {
        const type: string = jsonObject[MODEL_TYPE];
        const id: string = jsonObject[MODEL_ID];
        const dummy = this.constructors[type];
        console.log("TS type " + type + "  id " + id + "  nr pf constructors: "+ JSON.stringify(this.constructors));
        if (dummy === undefined) {
            console.log(JSON.stringify(jsonObject));
        }

        const result = Object.create((dummy as any).prototype);
        this.revivedTypeScriptObjects.set(id, result);

        for (var key of Object.getOwnPropertyNames(jsonObject)) {
            if (key === MODEL_ID) {
                continue;
            }
            const value = jsonObject[key];
            if (value === undefined) {
                continue;
            }
            // TODO Add other primitive property types
            if (typeof value === "string") {
                result[key] = value;
            } else if (typeof value === "number") {
                result[key] = value;
            } else if (typeof value === "boolean") {
                result[key] = value;
            } else {
                if (Array.isArray(value)) {
                    if (result[key] === undefined) {
                        result[key] = [];
                    }
                    for (var item in value) {
                        result[key].push(this.toTypeScriptInstance(value[item]));
                    }
                } else {
                    if (ModelInfo.references.contains(type, key)) {
                        const refId: string = jsonObject[key]["idref"];
                        const refObject = { reference: true, id: refId };
                        result[key] = refObject;
                        this.unresolvedReferences.push({ object: result, key: key });
                    } else {
                        result[key] = this.toTypeScriptInstance(value);
                    }
                }
            }
        }
        return result;
    }

    /**
     * Resolve all references in the last TypeScript object that has been created by `toTypeScriptInstanceInternal`.
     */
    private resolveRefs(): void {
        this.unresolvedReferences.forEach(ref => {
            console.log("resolve typescript identity " + ref.key);
            ref.object[ref.key] = this.revivedTypeScriptObjects.get(ref.object[ref.key].id);
        });
    }

    //////////////////////////////////////////////////////////////////
    //
    //  TypeScript to JSON conversion
    //
    /////////////////////////////////////////////////////////////////

    private unresolvedRefIdentities: { object: Object; key: string }[] = [];
    private createdObjects: Map<Object, string> = new Map<Object, string>();

    toPrintableJSON(object: DecoratedModelElement): Object {
        this.createdObjects.clear();
        this.unresolvedRefIdentities = [];
        const result = this.convertToJSON(object, false);
        this.resolveObjectRefIdentities();
        return result;
    }

    toSerializableJSON(object: DecoratedModelElement): Object {
        this.createdObjects.clear();
        this.unresolvedRefIdentities = [];
        const result = this.convertToJSON(object, true);
        this.resolveObjectRefIdentities();
        return result;
    }

    private resolveObjectRefIdentities() {
        this.unresolvedRefIdentities.forEach(ref => {
            const referenceObject = ref.object[ref.key];
            console.log("resolve JSON identity " + ref.key);
            referenceObject.idref = this.createdObjects.get(referenceObject.objectref);
            referenceObject.objectref = undefined;
        });
    }
    /**
     * Create JSON Object, taking care of references that might be circular.
     * Each reference becomes an object with property `reference` set to true and `$id`
     * set to the ID of the referred object.
     */
    convertToJSON(tsObject: DecoratedModelElement, serialize: boolean): Object {
        var result: Object = this.createJsonObjectFor(tsObject, serialize);
        Object.keys(tsObject).forEach(key => {
            console.log("    key " + key);
            if (key.startsWith(MODEL_PREFIX)) {
                const simpleKey = key.substring(MODEL_PREFIX_LENGTH);
                var value = tsObject[key.substring(MODEL_PREFIX_LENGTH)];
                if (ModelInfo.listparts.contains(tsObject[MODEL_TYPE], simpleKey)) {
                    console.log("_PI_ prefix found for list");
                    const parts: Object[] = tsObject[simpleKey];
                    result[simpleKey] = [];
                    for (var i: number = 0; i < parts.length; i++) {
                        result[simpleKey][i] = this.convertToJSON(parts[i] as any, serialize);
                    }
                } else {
                    console.log("_PI_ prefix found for object: " + simpleKey);
                    // Object
                    console.log(" ==> " + ModelInfo.parts.contains(tsObject[MODEL_TYPE], simpleKey));
                    result[simpleKey] = this.convertToJSON(value as MobxModelElementImpl, serialize);
                }
            } else if (key === "container" || key === "propertyName" || key === "propertyIndex") {
                console.log("Skipping container/propertName/Index");
            } else {
                console.log("Nortal property: " + key);
                var value = tsObject[key];
                if (typeof value === "string") {
                    result[key] = value;
                } else if (typeof value === "number") {
                    result[key] = value;
                } else if (typeof value === "boolean") {
                    result[key] = value;
                } else if (value === undefined) {
                } else {
                    console.log("Assume reference is ");
                    // TODO Assume reference object !
                    // result[key] = { reference: true, idref: value["$id"] }
                    result[key] = { reference: true, objectref: value };
                    this.unresolvedRefIdentities.push({ object: result, key: key });
                }
            }
        });

        return result;
    }

    private createJsonObjectFor(tsObject: Object, serialize: boolean) {
        console.log("createJsonObjectFor " + tsObject);
        const result: Object = {};
        if (serialize) {
            result[MODEL_ID] = this.identification++;
            console.log("created object " + result[MODEL_ID]);
        }
        this.createdObjects.set(tsObject, result[MODEL_ID]);
        return result;
    }
}
