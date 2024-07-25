import { ParseLocation, FreParseLocation } from "./parsingAndChecking/FreGenericParser.js";

// root of the inheritance structure of all elements that can be present in any of the definitions
export class FreMetaDefinitionElement {
    location: ParseLocation = // used to store the location information from the PEGJS parser
    {
        filename: '',
        end: {
            offset: 0,
            line: 0,
            column: 0
        },
        start: {
            offset: 0,
            line: 0,
            column: 0
        }
    };
    aglParseLocation: FreParseLocation = new FreParseLocation();  // used to store the location information from the AGL parser
}
