import {Attribute, OclPart, UmlClass, UmlPackage, UmlPart} from "../language/gen";
import {FreNamedNode, FreNodeReference, FreParseLocation} from "@freon4dsl/core";
import {LocationRange} from "peggy";
import {parser} from "pegjs";

let currentFileName: string = "UNKNOWN_FILE";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}
export function resetCurrentFileName() {
    currentFileName = "UNKNOWN_FILE";
}

export function pegLocationToFreLocation(data: LocationRange): FreParseLocation {
    let line: number = 0;
    if (!!data.start.line) {
        line = data.start.line;
    }
    let column: number = 0;
    if (!!data.start.column) {
        column = data.start.column;
    }
    const result: FreParseLocation = FreParseLocation.create({
        filename: currentFileName,
        line: line,
        column: column
    });
    return result;
}

export function createReferenceList(data: Object, type: string): FreNodeReference<any>[] {
    const result: FreNodeReference<any>[] = [];
    if (!!data) {
        if (Array.isArray(data)) {
            data.forEach(xx => {
                if (Array.isArray(xx)) {
                    result.push(FreNodeReference.create(xx, type));
                }
            })
        }
    }
    return result;
}

export function createOclPart(data: Partial<OclPart>): OclPart {
    const result: OclPart = new OclPart();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.parseLocation) {
        result.parseLocation = data.parseLocation;
    }
    // console.log("Parsed OclPart: " + result.name + " at line " + result.parseLocation.toString())
    return result;
}

export function printUmlPackage(umlPackage: UmlPackage) {
    console.log("Parsed UmlPackage: " + umlPackage.name + " at line " + umlPackage.parseLocation.toString() +
        "\n\twith classifiers: [" + umlPackage.classifiers.map(attr => attr.name).join(", ") + "]" +
        "\n\twith interfaces: [" + umlPackage.interfaces.map(attr => attr.name).join(", ") + "]" +
        "\n\twith associations: [" + umlPackage.associations.map(attr => attr.name).join(", ") + "]" +
        "\n\twith imports: [" + umlPackage.imports.map(attr => attr.name).join(", ") + "]"
    )
    umlPackage.classifiers.forEach(cls => {
        console.log("Parsed Classifier: " + cls.name +
            ", generalizations: " + cls.generalizations.map(gen => gen.pathnameToString("--")))
    })
}
