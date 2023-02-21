import { FreDefinitionElement } from "../FreDefinitionElement";
import { ParseLocation } from "./FreGenericParser";

export class ParseLocationUtil {
    static location(elem: FreDefinitionElement): string {
        if (!!elem) {
            if (!!elem.location) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.location.filename);
                return `[file: ${shortFileName}:${elem.location.start.line}:${elem.location.start.column}]`;
            } else if (!!elem.aglParseLocation) {
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
