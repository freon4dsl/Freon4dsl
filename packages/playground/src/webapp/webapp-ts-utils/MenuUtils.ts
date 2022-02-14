import { editorEnvironment } from "../WebappConfiguration";

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
    for (let [key, value] of editorEnvironment.fileExtensions) {
        result += value + ", ";
    }
    // TODO remove last comma
    return result;
}
