import { FreNamedNode, FreNodeReference, isNullOrUndefined, notNullOrUndefined, ownerOfType } from "@freon4dsl/core"
import synchronizedPrettier from "@prettier/sync";
// import { DefinitionSchema, isObjectDefinition, isPrimitiveDefinition, PrimitiveDefinition } from "@lionweb/validation"
import { MessageGroup, ObjectType, PrimitiveType, PropertyDef, Type, Types } from "../../language/gen/index.js"

export class TypeTemplates {
    
    constructor() {
    }
    /** 
     * Convert a DefinitionSchema to a collection of typescript types
     */
    commandTemplate(messageGroup: MessageGroup, doclinkRoot: string): string {
        const referredTypes: Set<FreNodeReference<Type>> = new Set<FreNodeReference<Type>>()
        let result = `
            
            ${messageGroup.messages.map(msg => {
            const typeName = `${msg.name}${msg.name.endsWith(messageGroup.name) ? "" : messageGroup.name}`
                    return`
                            /**
                              *  @see ${doclinkRoot ?? "unknown"}-${msg.name}
                              */
                            export type ${typeName} = {
                            ${msg.properties.concat(messageGroup.sharedProperties).map((propDef) => {
                                    return this.generatePropertyDef(messageGroup, msg, propDef, referredTypes)
                                }).join(",\n")
                            }
                            }
                            `
            }).join("\n")}
        
            // The overall "super-type"    
            export type Delta${messageGroup.name} = ${messageGroup.messages.map(msg =>
                `${msg.name}${msg.name.endsWith(messageGroup.name) ? "" : messageGroup.name}`
            ).join(" |\n")}
            
            export function isDelta${messageGroup.name}(object: unknown): object is Delta${messageGroup.name} {
               const castObject = object as Delta${messageGroup.name}
                return (
                    castObject.messageKind !== undefined && [ ${messageGroup.messages.map(msg =>
                        `"${msg.name}"`
                    ).join(",\n")} ].includes(castObject.messageKind)
                )
            }`

        // Handle import statements

        const defNames = messageGroup.messages.map(msg => msg.name)
        const uniqueReferredTypes = new Set<FreNodeReference<FreNamedNode>>();
        const uniqueReferredNames = new Set<string>();
        referredTypes.forEach(ref => {
            if( !uniqueReferredNames.has(ref.name) ) {
                uniqueReferredNames.add(ref.name)
                uniqueReferredTypes.add(ref)
            }
        })
        const importsText: string[] = []
        Array.from(uniqueReferredTypes.values()).forEach(ref => {
            if (notNullOrUndefined(ref.referred)) {
                const namespace = ownerOfType(ref.referred, "Types") as Types
                if (notNullOrUndefined(namespace)) {
                    importsText.push(`import { ${ref.referred.name} } from "./${namespace.name}.js";`)
                } else {
                    const namespace2 = ownerOfType(ref.referred, "MessageGroup") as MessageGroup
                    if (notNullOrUndefined(namespace2)) {
                        importsText.push(`import { ${ref.referred.name} } from "./${namespace2.name}.js";`)
                    } else {
                        importsText.push(`// cannot find import for ${ref.name}`)
                    }
                }
            } else {
                console.log(`undefined referred for ${ref.name}`)
            }
        })
        return `
                ${importsText.join("\n")}

                ${result}
        `
    }
    
    generatePropertyDef(messageGroup: MessageGroup | undefined, msg: ObjectType, propDef: PropertyDef, referredTypes: Set<FreNodeReference<Type>>): string {
        referredTypes.add(propDef.type)
        const optional = (propDef.isOptional ? "?" : "")
        const isList = propDef.isList ? "[]" : ""
        const isDiscriminator = messageGroup?.taggedUnionProperty === propDef.name
        if (isDiscriminator) {
            return `${propDef.name} : "${msg.name}"`
        } else {
            return `${propDef.name}${optional} : ${this.tsType(messageGroup, propDef.$type?.name)}${isList}`
        }

    }
    
    tsType(messageGroup: MessageGroup | undefined, type: string): string {
        if (messageGroup !== undefined && type === messageGroup.name) {
            // overall type handles special
            return "Delta" + type
        } else {
            return type
        }
    }

    typeTemplate(types: Types): string {
        const referredTypes: Set<FreNodeReference<Type>> = new Set<FreNodeReference<Type>>()
        const primitives = types.primitiveTypes.map(primType => 
            `export type ${primType.name} = ${primType.primitiveType}`
        )
        const objects = types.objectTypes.map(objType => {
            return `
                export type ${objType.name} = {
                    ${objType.properties.map(propDef => this.generatePropertyDef(undefined, objType, propDef, referredTypes)).join("\n")}
                }
            `
        })

        const uniqueReferredTypes = new Set<FreNodeReference<FreNamedNode>>();
        const uniqueReferredNames = new Set<string>();
        referredTypes.forEach(ref => {
            if( !uniqueReferredNames.has(ref.name) ) {
                uniqueReferredNames.add(ref.name)
                uniqueReferredTypes.add(ref)
            }
        })

        // Handle import statements
        const importsText: string[] = []
        Array.from(uniqueReferredTypes.values()).forEach(ref => {
            if (notNullOrUndefined(ref.referred)) {
                const namespace = ownerOfType(ref.referred, "Types") as Types
                if (notNullOrUndefined(namespace) && namespace !== types) {
                    importsText.push(`import { ${ref.referred.name} } from "./${namespace.name}.js";`)
                } else {
                    const namespace2 = ownerOfType(ref.referred, "MessageGroup") as MessageGroup
                    if (notNullOrUndefined(namespace2)) {
                        importsText.push(`import { ${ref.referred.name} } from "./${namespace2.name}.js";`)
                    } else if (namespace !== types) {
                        importsText.push(`// cannot find import for ${ref.name}`)
                    }
                }
            } else {
                console.log(`undefined referred for ${ref.name}`)
            }
        })
        return `
            ${importsText.join("\n")}

            ${primitives.join("\n")}

            ${objects.join("\n")}
        `
    }
    
    messageGroup2DefinitionTemplate(messageGroup: MessageGroup): string {
        return `
        import { MessageGroup } from "../generic/schema/SyntaxDefinition.js";
        
        export const ${messageGroup.name}Definitions: MessageGroup = {
            "name": "${messageGroup.name}",
            "taggedUnionProperty": "${messageGroup.taggedUnionProperty}",
            "sharedProperties": [
                ${messageGroup.sharedProperties.map(shared => {
                    return this.generatePropertyJson(shared)
                }).join(",\n")}
            ],
            "messages": [
                ${messageGroup.messages.map(message => {
                    return `{
                                "name": "${message.name}",
                                "properties": [
                                    ${message.properties.concat(messageGroup.sharedProperties).map(prop => {
                                        return this.generatePropertyJson(prop)
                                    }).join(",\n")}
                                ]
                            }`
                }).join(",\n")}
            ]
        }`
    }

    types2DefinitionTemplate(types: Types): string {
        return `
        import { TypeGroup } from "../generic/schema/SyntaxDefinition.js";

        export const ${types.name}Definitions: TypeGroup = {
            "name": "${types.name}",
            "primitiveTypes": [
                ${types.primitiveTypes.map(prim => {
                    return this.generatePrimitiveTypeJson(prim)
                }).join(",\n")}
            ],
            "structuredTypes": [
                ${types.objectTypes.map(objectType => {
                    return `{
                        "name": "${objectType.name}",
                        "properties": [
                            ${objectType.properties.map(prop => {
                                return this.generatePropertyJson(prop)
                            }).join(",\n")}
                        ]
                    }`
                }).join(",\n")}
            ]
        }`
    }

    generatePropertyJson(prop: PropertyDef): string {
        return `{
                    "name": "${prop.name}",
                    "type": "${prop.type.name}",
                    "isList": ${prop.isList ?? false},
                    "isOptional": ${prop.isOptional ?? false},
                    "mayBeNull": ${prop.mayBeNull ?? false},
                }`
    }

    generatePrimitiveTypeJson(primType: PrimitiveType): string {
        return `{
                    "name": "${primType.name}",
                    "primitiveType": "${primType.primitiveType}",
                }`
    }
    public static pretty(format: string, typescriptFile: string, message?: string): string {
        // return typescriptFile
        try {
            return (
                // parser: the language used
                // printWidth: the width of the lines
                // tabWidth: the width of a tab
                // plugins: the programming language used -- adds a predefined plugin for typescript
                synchronizedPrettier.format(typescriptFile, {
                    parser: format,
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
            if (notNullOrUndefined(message)) {
                return "// Generated by the Freon Language Generator." + "\n" + typescriptFile
            } else {
                return typescriptFile
            }
        }
    }
}
