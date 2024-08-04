import { ListJoinType } from "./FreEditDefLang.js";

export class EditorDefaults {
    static globalReferenceSeparator = ".";
    static startBracket = "{";
    static endBracket = "}";
    static globalIndent = 4;
    static listJoinType = ListJoinType.Separator;
    static listJoinText = "";
    // Other defaults for listInfo are set in class ListInfo.
    // Their values are:
    //  isTable: boolean = false;
    //  direction: FreEditProjectionDirection = FreEditProjectionDirection.Vertical;
    // Defaults for trigger and symbol are set in EditorDefaultsGenerator.
    // Both values are determined by Names.classifier(classifier).

    // for parser/unparser
    static parserGroupName = "parser";
}
