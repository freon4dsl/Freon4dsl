import { PiDefinitionElement } from "../PiDefinitionElement";
import { ParseLocation } from "./PiParser";

export class ParseLocationUtil {
    static location(elem: PiDefinitionElement): string {
        if (!!elem) {
            if (!!elem.location) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.location.filename);
                return `[file: ${shortFileName}:${elem.location.start.line}:${elem.location.start.column}]`;
            } else if (!!elem.agl_location) {
                const shortFileName: string = ParseLocationUtil.getShortFileName(elem.agl_location.filename);
                return `[file: ${shortFileName}:${elem.agl_location.line}:${elem.agl_location.column}]`;
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
