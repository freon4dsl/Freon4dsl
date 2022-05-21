import { editorEnvironment } from "../../config/WebappConfiguration";

export class MenuItem {
    title: string;
    action: (id: number) => void;
    icon?: Object;
    id: number;
}

export function metaTypeForExtension (extension: string) {
    for (let [key, value] of editorEnvironment.fileExtensions) {
        if (value === extension)
            return key;
    }
    return "";
}

export function allExtensionsToString() : string {
    let result: string = '';
    const size: number = editorEnvironment.fileExtensions.size;
    let i: number = 0;
    for (let [key, value] of editorEnvironment.fileExtensions) {
        result += value;
        if (i < size - 1) { // only add a comma between, not after, the extensions.
            result += ", ";
            i++;
        }
    }
    return result;
}
