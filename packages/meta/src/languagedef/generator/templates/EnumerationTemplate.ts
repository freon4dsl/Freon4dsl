// import { Names } from "../../../utils/Names";
// import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
// import { PiLangEnumeration } from "../../metalanguage/PiLanguage";
//
// export class EnumerationTemplate {
//     constructor() {
//     }
//
//     generateEnumeration(enumeration: PiLangEnumeration, relativePath: string): string {
//         const language = enumeration.language;
//         const extendsClass = "MobxModelElementImpl";
//         const isBinaryExpression = false;
//         const isExpression = false;
//         const implementsPi = (isExpression ? "PiExpression": (isBinaryExpression ? "PiBinaryExpression" : "PiElement"));
//         const enumerationName = Names.enumeration(enumeration);
//
//         const mobxImports: string[] = ["model"];
//         // if( element.references.length > 0) {
//         //     mobxImports.push("observable")
//         // }
//         mobxImports.push("MobxModelElementImpl");
//
//         // Template starts here
//         return `
//         import * as uuid from "uuid";
//         import { ${Names.metaType(language)} } from "./${Names.metaType(language)}";
//         import { ${mobxImports.join(",")} } from "${PROJECTITCORE}";
//         import { ${Names.PiElement}, ${Names.PiExpression}, ${Names.PiBinaryExpression } } from "${PROJECTITCORE}";
//
//         export class ${enumerationName} extends ${extendsClass} implements ${implementsPi} {
//             readonly $typename: ${language.name}ConceptType = "${enumerationName}";
//             $id: string;
//
//             constructor(name: string, id?: string) {
//                 super();
//                 this.name = name;
//                 if (!!id) {
//                     this.$id = id;
//                 } else {
//                     this.$id = uuid.v4();
//                 }
//             }
//
//             ${enumeration.literals.map(lit =>
//                 `static ${lit}: ${enumerationName} = ${enumerationName}.fromString("${lit}")` ).join(";")}
//             static $piANY : ${enumerationName} = ${enumerationName}.fromString("$piANY");
//
//             static values = [${enumeration.literals.map(l => `${enumerationName}.${l}`).join(", ")}]
//
//             public readonly name : string;
//
//             public asString(): string {
//                 return this.name;
//             }
//
//             static fromString(v: string): ${enumerationName} {
//                 switch(v) {
//                     ${enumeration.literals.map(lit => `case "${lit}":
//                     if (this.${lit} !== null) {
//                         return new ${enumerationName}("${lit}");
//                     } else {
//                         return ${enumerationName}.${lit};
//                     }`
//                     ).join(";")}
//                     default:
//                     if (this.$piANY !== null) {
//                         return new ${enumerationName}("$piANY");
//                     } else {
//                         return ${enumerationName}.$piANY;
//                     }
//                 }
//             }
//
//             piLanguageConcept(): ${language.name}ConceptType {
//                 return this.$typename;
//             }
//
//             piId(): string {
//                 return this.$id;
//             }
//
//             piIsExpression(): boolean {
//                 return ${isExpression || isBinaryExpression};
//             }
//
//             piIsBinaryExpression(): boolean {
//                 return ${isBinaryExpression};
//             }
//
//         }`;
//     }
// }
