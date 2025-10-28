import { FreNodeReference, notNullOrUndefined, ownerOfType } from "@freon4dsl/core"
import synchronizedPrettier from "@prettier/sync";
// import { DefinitionSchema, isObjectDefinition, isPrimitiveDefinition, PrimitiveDefinition } from "@lionweb/validation"
import { MessageGroup, ObjectType, PropertyDef, Type, Types } from "../../language/gen/index.js"

export class TypeTemplates {

    schema: MessageGroup
    doclinkRoot: string
    
    constructor(schema: MessageGroup, doclinkRoot: string) {
        this.schema = schema
        this.doclinkRoot = doclinkRoot
    }
    /** 
     * Convert a DefinitionSchema to a collection of typescript types
     */
    commandTemplate(): string {
        const referredTypes: Set<FreNodeReference<Type>> = new Set<FreNodeReference<Type>>()
        let result = `
            
            ${this.schema.messages.map(msg => {
                    return`
                            /**
                              *  @see ${this.doclinkRoot}-${msg.name}
                              */
                            export type ${msg.name}${this.schema.name} = {
                            ${msg.properties.concat(this.schema.sharedProperties).map((propDef) => {
                                    return this.generatePropertyDef(msg, propDef, referredTypes)
                                }).join(",\n")
                            }
                            }
                            `
            }).join("\n")}
            `
        const defNames = this.schema.messages.map(msg => msg.name)
        const uniqueReferredTypes = new Set<FreNodeReference<any>>();
        const uniqueReferredNames = new Set<string>();
        referredTypes.forEach(ref => {
            if( !uniqueReferredNames.has(ref.name) ) {
                uniqueReferredNames.add(ref.name)
                uniqueReferredTypes.add(ref)
            }
        })
        const importsText: string[] = []
        const imports = Array.from(uniqueReferredTypes.values()).map(t => t.referred).forEach(referred => {
            if (notNullOrUndefined(referred)) {
                const namespace = ownerOfType(referred, "Types") as Types
                importsText.push(`import { ${referred.name} } from "./${namespace.name}.js";`)
            } else {
                console.log("undegfined nreferred")
            }
        })
        return `
                ${importsText.join("\n")}
                ${result}
        `
    }
    
    generatePropertyDef(msg: ObjectType, propDef: PropertyDef, referredTypes: Set<FreNodeReference<Type>>): string {
        referredTypes.add(propDef.type)
        const optional = (propDef.isOptional ? "?" : "")
        const isList = propDef.isList ? "[]" : ""
        const isDiscriminator = this.schema?.taggedUnionProperty === propDef.name
        if (isDiscriminator) {
            return `${propDef.name} : "${msg.name}"`
        } else {
            return `${propDef.name}${optional} : ${this.tsType(propDef.$type?.name)}${isList}`
        }

    }
    
    tsType(type: string): string {
        return `${type}`
    }

    typeTemplate(types: Types): string {
        const referredTypes: Set<FreNodeReference<Type>> = new Set<FreNodeReference<Type>>()
        const primitives = types.primitiveTypes.map(primType => 
            `export type ${primType.name} = ${primType.primitiveType}`
        )
        const objects = types.objectTypes.map(objType => {
            return `
                export type ${objType.name} = {
                    ${objType.properties.map(propDef => this.generatePropertyDef(objType, propDef, referredTypes)).join("\n")}
                }
            `
        })
        return `
            ${primitives.join("\n")}

            ${objects.join("\n")}
        `
    }

    // sharedTemplate(typeMap: DefinitionSchema, doclinkRoot: string ): string {
    //     const referredTypes: Set<string> = new Set<string>()
    //     let result = `
    //         import { LionWebJsonNode } from "@lionweb/json"
    //
    //         ${typeMap.definitions().map(def => {
    //         if (isObjectDefinition(def)) {
    //             return`
    //                         /**
    //                           *  @see ${doclinkRoot}-${def.name}
    //                           */
    //                         export type ${def.name} = {
    //                             ${def.properties.map((propDef) => {
    //                                 referredTypes.add(propDef.type)
    //                                 return`${propDef.name}${(propDef.isOptional ? "?" : "")} : ${propDef.type}${propDef.isList ? "[]" : ""}`
    //                             }).join(",\n")}
    //                         }
    //                         `
    //         } else if (isPrimitiveDefinition(def) ) {
    //             return  `
    //                         export type ${def.name} = ${def.primitiveType}
    //                         `
    //         }
    //     }).join("\n")}
    //         `
    //     const defNames = typeMap.definitions().map(d => d.name)
    //     const imports = Array.from(referredTypes.values()).filter(ref => !defNames.includes(ref) )
    //     return `
    //             ${result}
    //     `
    // }

    public static pretty(typescriptFile: string, message: string): string {
        // return typescriptFile
        try {
            return (
                // parser: the language used
                // printWidth: the width of the lines
                // tabWidth: the width of a tab
                // plugins: the programming language used -- adds a predefined plugin for typescript
                synchronizedPrettier.format(typescriptFile, {
                    parser: "typescript",
                    plugins: [],
                    printWidth: 160,
                    tabWidth: 4,
                })
            );
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Syntax error in generated code: " + message);
                console.log(typescriptFile)
            }
            return "// Generated by the Freon Language Generator." + "\n" + typescriptFile;
        }
    }
}
