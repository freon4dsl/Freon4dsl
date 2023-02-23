import { ListJoinType } from "./FreEditDefLang";

export class EditorDefaults {
    static standardReferenceSeparator = ".";
    static startBracket = "{";
    static endBracket = "}";
    static standardIndent = 4;
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
