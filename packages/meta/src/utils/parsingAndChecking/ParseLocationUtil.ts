import { FreMetaDefinitionElement } from "../FreMetaDefinitionElement";
import { ParseLocation } from "./FreGenericParser";

export class ParseLocationUtil {
    static location(elem: FreMetaDefinitionElement): string {
        if (!!elem) {
            if (!!elem.location && !!elem.location.filename) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.location.filename);
                return `[file: ${shortFileName}:${elem.location.start.line}:${elem.location.start.column}]`;
            } else if (!!elem.aglParseLocation && !!elem.aglParseLocation.filename) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.aglParseLocation.filename);
                return `[file: ${shortFileName}:${elem.aglParseLocation.line}:${elem.aglParseLocation.column}]`;
            }
        }
        return `[no location]`;
    }

    static locationPlus(fileName: string, location: ParseLocation) {
        if (!!location && !!fileName) {
            const shortFileName: string = this.getShortFileName(fileName);
            return `[file: ${shortFileName}:${location.start.line}:${location.start.column}]`;
        }
        return `[no location]`;
    }

    private static getShortFileName(filename: string): string {
        let names: string[] = [];
        if (filename.includes("\\")) {
            names = filename.split("\\");
        } else if (filename.includes("/")) {
            names = filename.split("/");
        }
        return names[names.length - 1];
    }
}
