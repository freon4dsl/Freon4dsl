import { EditorState } from "./EditorState";
import { setUserMessage } from "../components/stores/UserMessageStore";
import { editorEnvironment, serverCommunication } from "../config/WebappConfiguration";
import type { PiModelUnit } from "@projectit/core";
import { editorProgressShown } from "../components/stores/ModelStore";

export class ImportExportHandler {

    importUnits(fileList: FileList){
        editorProgressShown.set(true);
        const reader = new FileReader();
        // todo check whether the name of the unit already exists in the model
        for (let file of fileList) {
            // todo async: wait for file to be uploaded before starting next
            // todo do something with progress indicator
            // to check whether the file is recognisable as a model unit, we examine the file extension
            const extension: string = file.name.split(".").pop();
            let metaType: string = this.metaTypeForExtension(extension);
            // if the right extension has been found, continue
            if (metaType.length > 0) {
                reader.readAsText(file);
                reader.onload = function() {
                    const text = reader.result;
                    if (typeof text == "string") {
                        try {
                            EditorState.getInstance().unitFromFile(file.name.split(".").shift(), reader.result as string, metaType);
                        } catch (e) {
                            setUserMessage(`${e.message}`);
                        }
                    }
                };
                reader.onerror = function() {
                    setUserMessage(reader.error.message);
                };
            } else {
                setUserMessage(`File ${file.name} does not have the right (extension) type.
                 Found: ${extension}, expected one of: ${this.allExtensionsToString()}.`);
            }
        }
        editorProgressShown.set(false);
    }

    async exportUnit(unit: PiModelUnit) {
        // get the complete unit from the server
        await serverCommunication.loadModelUnit(EditorState.getInstance().currentModel.name, unit.name, (completeUnit: PiModelUnit) => {
            this._exportUnit(completeUnit);
        });
    }

    private _exportUnit(unit: PiModelUnit) {
        // do not try to export a unit with errors, parsing and unparsing will not proceed correctly
        const list = editorEnvironment.validator.validate(unit);
        if (list.length > 0) {
            setUserMessage(`Cannot export a unit that has errors (found ${list.length}).`);
            console.log("Errors: " + list.map(l => l.message).join(", "))
            return;
        }
        // create a text string from the unit
        let text: string = editorEnvironment.writer.writeToString(unit);

        // get the default file name from the unit
        const fileExtension: string = editorEnvironment.fileExtensions.get(unit.piLanguageConcept());
        let defaultFileName: string = unit.name + fileExtension;

        // create a HTML element that contains the text string
        let textFile = null;
        const data = new Blob([text], { type: "text/plain" });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            URL.revokeObjectURL(textFile);
        }
        textFile = URL.createObjectURL(data);

        // create a link for the download
        const link = document.createElement("a");
        link.setAttribute("download", defaultFileName);
        link.href = textFile;
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function() {
            var event = new MouseEvent("click");
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    }

    private allExtensionsToString() : string {
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

    private metaTypeForExtension (extension: string) {
        for (let [key, value] of editorEnvironment.fileExtensions) {
            if (value === extension)
                return key;
        }
        return "";
    }
}
