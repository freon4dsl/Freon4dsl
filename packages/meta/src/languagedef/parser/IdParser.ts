import { IdMap } from "../../commandline/IdMap.js";
import { LOG2USER } from "../../utils/index.js";
// import {
//     PropertyDefinition,
//     ValidationIssue,
//     JsonContext,
//     Syntax_ArrayContainsNull_Issue,
//     Syntax_PropertyTypeIssue,
//     UnknownObjectType,
//     Syntax_PropertyNullIssue,
//     Syntax_PropertyUnknownIssue,
//     Syntax_PropertyMissingIssue,
//     PropertyType
// } from "@lionweb/validation";

export type IdProperty = {
    name: string
    id: string
    key: string
}

export type IdClassifier = {
    name: string
    id: string
    key: string
    properties: IdProperty[]
}

// export type IdConcept = IdClassifier & {
//     concept: string
// }
//
// export type IdInterface = IdClassifier & {
//     interface: string
// }

export type IdLimited = {
    instance: string
    id: string
    key: string
}

export type IdUsedLanguage = {
    name: string
    key: string
    id: string // TODO Needed?
    version: string
}
export type IdJson = {
    language: string
    version: string
    key: string
    languages: IdUsedLanguage[]
    classifiers: IdClassifier[]
    limited: IdLimited[]
}

export function parseIds(json: any): IdMap {
    LOG2USER.log("PARSE IDS");
    const idData = json as IdJson;
    const idMap = new IdMap();
    // validateIdSyntax(json);

    for (const jsonLanguage of idData.languages) {
        idMap.setLanguageIdAndKey(jsonLanguage.name, jsonLanguage.id, jsonLanguage.key);
    }
    for (const classifier of idData.classifiers) {
        idMap.setClassifierIdAndKey(classifier.name, classifier.id, classifier.key);
        const properties = classifier.properties;
        for (const jsonProperty of properties) {
            idMap.setPropertyIdAndKey(classifier.name, jsonProperty.name, jsonProperty.id, jsonProperty.key);
        }
    }
    return idMap;
}

// const ID_JSON_PROPERTIES: PropertyDefinition[] = [
//     {
//         property: "serializationFormatVersion",
//         expectedType: "string",
//         mayBeNull: false,
//         validateValue: undefined
//     },
//     { property: "language", expectedType: "string", mayBeNull: false },
//     { property: "version", expectedType: "string", mayBeNull: false },
//     { property: "key", expectedType: "string", mayBeNull: false },
//     { property: "languages", expectedType: "array", mayBeNull: false },
//     { property: "concepts", expectedType: "array", mayBeNull: false },
//     { property: "interfaces", expectedType: "array", mayBeNull: false },
//     { property: "limited", expectedType: "array", mayBeNull: false }
// ];
//
// function validateIdSyntax(json: any) {
//     propertyChecks(json, ID_JSON_PROPERTIES, null);
// }
//
// /**
//  * Check whether all property definitions in `propDef` are correct and check that there are
//  * no iother properties in `obj`.
//  * @param obj
//  * @param propDefs
//  * @param context
//  */
// function propertyChecks(obj: unknown, propDefs: PropertyDefinition[], context: JsonContext): void {
//     if (!this.checkType(obj, "object", context)) {
//         return;
//     }
//     const object = obj as UnknownObjectType;
//     const allProperties: string[] = [];
//     propDefs.forEach(propDef => {
//         if (propDef.property === "key") {
//             // console.log("CHECKING KEY of " + JSON.stringify(obj))
//         }
//         if (
//             checkPropertyType(object, propDef.property, propDef.expectedType, propDef.mayBeNull, context.concat(propDef.property))
//         ) {
//             const propValue = object[propDef.property];
//             if (this.recursive && propDef.expectedType === "array" && Array.isArray(propValue) && !!propDef.validateValue) {
//                 propValue.forEach((arrayItem: unknown, index: number) => {
//                     if (arrayItem === null) {
//                         issue(
//                             new Syntax_ArrayContainsNull_Issue(context.concat(propDef.property, index), propDef.property, index)
//                         );
//                     } else {
//                         if (propDef.validateValue !== null && propDef.validateValue !== undefined) {
//                             propDef.validateValue(arrayItem, context.concat(propDef.property, index));
//                         } else {
//                             //  TODO: give an error, whih ine?
//                         }
//                     }
//                 });
//             } else if (propDef.validateValue !== null && propDef.validateValue !== undefined) {
//                 // propValue is niot an array, so it should be aa string
//                 propDef.validateValue(propValue as string, context.concat(propDef.property));
//             }
//         }
//         allProperties.push(propDef.property);
//     });
//     checkStrayProperties(object, allProperties, context);
// }
//
// /**
//  * Check whether there are extra properties that should not be there.
//  * @param obj
//  * @param properties
//  * @param context
//  */
// function checkStrayProperties(obj: UnknownObjectType, properties: string[], context: JsonContext) {
//     const own = Object.getOwnPropertyNames(obj);
//     own.forEach(ownProp => {
//         if (!properties.includes(ownProp)) {
//             issue(new Syntax_PropertyUnknownIssue(context, ownProp));
//         }
//     });
//     properties.forEach(prop => {
//         if (!own.includes(prop)) {
//             issue(new Syntax_PropertyMissingIssue(context, prop));
//         }
//     });
// }
//
// /**
//  * Check whether the value of property `prop` of `obj` has type `expectedType`.
//  * @param obj
//  * @param prop
//  * @param expectedType
//  * @param context
//  */
// const checkPropertyType = (
//     obj: UnknownObjectType,
//     prop: string,
//     expectedType: PropertyType,
//     mayBeNull: boolean,
//     context: JsonContext
// ): boolean => {
//     if (prop === "key") {
//         // console.log("    checking type of key " + JSON.stringify(obj));
//     }
//     if (obj[prop] === undefined || obj[prop] === null) {
//         if (!mayBeNull) {
//             issue(new Syntax_PropertyNullIssue(context, prop));
//             return false;
//         } else {
//             return true;
//         }
//     } else {
//         const actualType = typeof obj[prop];
//         if (expectedType !== actualType) {
//             if (expectedType === "array" && actualType === "object") {
//                 // typeof returns an object for an array, so we need to check this separately.
//                 if (!Array.isArray(obj[prop])) {
//                     issue(new Syntax_PropertyTypeIssue(context, prop, "array", typeof obj[prop]));
//                     return false;
//                 } else {
//                     return true;
//                 }
//             } else {
//                 issue(new Syntax_PropertyTypeIssue(context, prop, expectedType, actualType));
//                 return false;
//             }
//         } else {
//             if (expectedType === "object") {
//                 // typeof returns an object for an array, so we need to check this separately.
//                 if (Array.isArray(obj[prop])) {
//                     issue(new Syntax_PropertyTypeIssue(context, prop, expectedType, "array"));
//                     return false;
//                 }
//             }
//         }
//     }
//     return true;
// };
//
// function issue(i: ValidationIssue) {
//
// }
