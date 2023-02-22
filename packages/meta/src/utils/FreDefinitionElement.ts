import { ParseLocation, FreParseLocation } from "./parsingAndChecking/FreGenericParser";

// root of the inheritance structure of all elements that can be present in any of the definitions
export class FreDefinitionElement {
    location: ParseLocation;        // used to store the location information from the PEGJS parser
    aglParseLocation: FreParseLocation;  // used to store the location information from the AGL parser
}
