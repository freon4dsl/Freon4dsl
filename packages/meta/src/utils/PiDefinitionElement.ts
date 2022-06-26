import { ParseLocation, PiParseLocation } from "./parsingAndChecking/PiParser";

// root of the inheritance structure of all elements that can be present in any of the definitions
export class PiDefinitionElement {
    location: ParseLocation;        // used to store the location information from the PEGJS parser
    agl_location: PiParseLocation;  // used to store the location information from the AGL parser
}
