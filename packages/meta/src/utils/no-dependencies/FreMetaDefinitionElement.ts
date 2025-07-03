// root of the inheritance structure of all elements that can be present in any of the definitions
export class FreMetaDefinitionElement {
    location: ParseLocation = // used to store the location information from the PEGJS parser
        {
            filename: "",
            end: {
                offset: 0,
                line: 0,
                column: 0,
            },
            start: {
                offset: 0,
                line: 0,
                column: 0,
            },
        };
    aglParseLocation: FreParseLocation = new FreParseLocation(); // used to store the location information from the AGL parser
}

// The following two types are used to store the location information from the PEGJS parser
// todo rethink how to adjust the errors from the PegJs parser
export type ParseLocation = {
  filename: string;
  start: Location;
  end: Location;
};

export type Location = {
  offset: number;
  line: number;
  column: number;
};


/**
 * This class is used to store the location information from the AGL parser.
 */
export class FreParseLocation {
  static create(data: Partial<FreParseLocation>): FreParseLocation {
    const result = new FreParseLocation();
    if (!!data.filename) {
      result.filename = data.filename;
    }
    if (!!data.line) {
      result.line = data.line;
    }
    if (!!data.column) {
      result.column = data.column;
    }
    return result;
  }
  filename: string = "";
  line: number = 0;
  column: number = 0;
}
