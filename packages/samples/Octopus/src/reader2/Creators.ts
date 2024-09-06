import {OclPart, UmlPackage, UmlPart} from "../language/gen";

export function createOclPart(data: Partial<OclPart>): OclPart {
    const result: OclPart = new OclPart();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.parseLocation) {
        result.parseLocation = data.parseLocation;
    }
    console.log("Parsed OclPart: " + result.name + " at line " + result.parseLocation.line)
    return result;
}

export function createUmlPart(data: Partial<UmlPart>): UmlPart {
    const result: UmlPart = new UmlPart();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.parseLocation) {
        result.parseLocation = data.parseLocation;
    }
    console.log("Parsed UmlPart: " + result.name + " at line " + result.parseLocation.line)
    return result;
}

export function createUmlPackage(data: Partial<UmlPackage>): UmlPackage {
    const result: UmlPackage = new UmlPackage();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.parseLocation) {
        result.parseLocation = data.parseLocation;
    }
    console.log("Parsed UmlPackage: " + result.name + " at line " + result.parseLocation.line)
    return result;
}
