// import { Definition, DefinitionSchema, isObjectDefinition, TaggedUnionDefinition } from "@lionweb/validation"
//
// export class ProcessorTemplate {
//
//     schema: DefinitionSchema
//     typePostFix: string
//
//     constructor(schema: DefinitionSchema, typePostFix: string) {
//         this.schema = schema
//         this.typePostFix = typePostFix
//     }
//    
//     mapTemplate(): string {
//         const dis = this.schema.unionDefinition.unionDiscriminator
//         const messagesForType = this.messageForTag(this.schema.unionDefinition)
//         return `
//             const processingFunctions: Map<string, (msg: ${dis}) => void> = new Map<string, (msg: ${dis}) => void>()
//             ${messagesForType.map(msg => `
//                 // @ts-expect-error TS2345
//                 processingFunctions.set("${msg.name}", ${msg.name}Function)`
//             ).join("\n")}
//            
//             ${messagesForType.map(msg => this.functionTemplate(msg)).join("\n")}
//         `
//     }
//    
//     functionTemplate(def: Definition): string {
//         return `
//             export function ${def.name}Function(msg: ${this.tsType(def.name)}): void {
//                 console.log("Called ${def.name}Function " + msg.${this.schema.unionDefinition.unionProperty})
//             }
//         `
//     }
//     classTemplate(): string {
//         return `export class ${this.typePostFix}Processor {
//             ${this.switchTemplate()}
//             ${this.processorTemplate()}
//         }`
//     }
//    
//     switchTemplate(): string {
//             const dis = this.schema.unionDefinition.unionDiscriminator
//             const messagesForType = this.messageForTag(this.schema.unionDefinition)
//             return `
//                 process(message: ${dis}): void {
//                     switch (message.${this.schema.unionDefinition.unionProperty}) {
//                         ${messagesForType.map(msg =>
//                         `case "${msg.name}" : {
//                              this.process${this.tsType(msg.name)}(message)
//                              break;
//                          }
//                         `).join("\n")}
//                     }
//                 }
//             `
//     }
//
//     tsType(type: string): string {
//         const typeDef = this.schema.getDefinition(type)
//         return isObjectDefinition(typeDef) ? `${type}${this.typePostFix}` : type
//     }
//
//
//     processorTemplate(): string {
//             const dis = this.schema.unionDefinition.unionDiscriminator
//             const messagesForType = this.messageForTag(this.schema.unionDefinition)
//             return `
//                 ${messagesForType.map(msg => 
//                     `process${this.tsType(msg.name)}(message: ${this.tsType(msg.name)}) {
//                         console.log("Processing message ${msg.name}")    
//                     }`).join("\n")}
//                 `
//     }
//    
//     private messageForTag(type: TaggedUnionDefinition): Definition[] {
//         console.log(`type ${type.unionDiscriminator}`)
//         return this.schema.definitions().filter(def => isObjectDefinition(def) && def.taggedUnionType === type.unionDiscriminator)
//
//     }
// }
