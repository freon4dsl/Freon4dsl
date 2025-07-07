import { EditorState } from "./EditorState.js";
import { setUserMessage } from "../components/stores/UserMessageStore.svelte";
import {type FreEnvironment, type FreModelUnit, isNullOrUndefined} from "@freon4dsl/core";
import { editorProgressShown } from "../components/stores/ModelStore.svelte";
import { WebappConfigurator } from "$lib/index.js";

// TODO rethink this class using Workers, see https://developer.mozilla.org/en-US/docs/Web/API/Worker

export class ImportExportHandler {
    private langEnv: FreEnvironment | undefined = WebappConfigurator.getInstance().editorEnvironment;

    importUnits(fileList: FileList) {
        editorProgressShown.value = true;
        let showIt: boolean = true; // only show the first of the imported units
        for (let file of fileList) {
            this.readSingleFile(file, showIt);
            showIt = false;
        }
        editorProgressShown.value = false;
    }

    private async readSingleFile(file: File, showIt: boolean) {
        const reader = new FileReader();
        // to check whether the file is recognisable as a model unit, we examine the file extension
        const extension: string | undefined = file.name.split(".").pop();
        let metaType: string = ''
        if (!isNullOrUndefined(extension)) {
            metaType = this.metaTypeForExtension(extension);
        }
        // if the right extension has been found, continue
        if (metaType.length > 0) {
            reader.readAsText(file);
            reader.onload = function () {
                const text = reader.result;
                if (typeof text == "string") {
                    try {
                        const filename: string | undefined = file.name.split(".").shift();
                        if (!isNullOrUndefined(filename)) {
                            EditorState.getInstance().unitFromFile(
                                filename,
                                reader.result as string,
                                metaType,
                                showIt,
                            );
                        }                    } catch (e: any) {
                        setUserMessage(`${e.message}`);
                    }
                }
            };
            reader.onerror = function () {
                setUserMessage(reader.error? reader.error.message : '');
            };
        } else {
            setUserMessage(`File ${file.name} does not have the right (extension) type.
                 Found: ${extension}, expected one of: ${this.allExtensionsToString()}.`);
        }
    }

    async exportUnit(unit: FreModelUnit) {
        // get the complete unit from the server
        // await serverCommunication.loadModelUnit(EditorState.getInstance().currentModel.name, unit.name, (completeUnit: FreModelUnit) => {
        //     this._exportUnit(completeUnit);
        // });
        // TODO: now only export current unit, could be extended to export other units as well.
        //       the code above runs into an error because the loaded modelunit is not placed into a model.
        this._exportUnit(unit);
    }

    private _exportUnit(unit: FreModelUnit) {
        // do not try to export a unit with errors, parsing and unparsing will not proceed correctly
        const list = this.langEnv?.validator.validate(unit);
        // TODO Only allow export of current unit for now.
        if (!isNullOrUndefined(list) && list.length > 0) {
            setUserMessage(`Cannot export a unit that has errors (found ${list.length}).`);
            console.log("Errors: " + list.map((l) => l.message).join(", "));
            return;
        }
        // create a text string from the unit
        let text: string = this.langEnv!.writer.writeToString(unit);

        // get the default file name from the unit
        const fileExtension: string | undefined = this.langEnv!.fileExtensions.get(unit.freLanguageConcept());
        let defaultFileName: string = unit.name + "." + fileExtension;

        // create an HTML element that contains the text string
        let textFile = null;
        const data = new Blob([text], { type: "text/plain" });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        // todo find out why this if-stat is here?
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
        window.requestAnimationFrame(function () {
            let event = new MouseEvent("click");
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    }

    private allExtensionsToString(): string {
        let result: string = "";
        const size: number = this.langEnv!.fileExtensions.size;
        let i: number = 0;
        for (let [key, value] of this.langEnv!.fileExtensions) {
            result += value;
            if (i < size - 1) {
                // only add a comma between, not after, the extensions.
                result += ", ";
                i++;
            }
        }
        return result;
    }

    private metaTypeForExtension(extension: string) {
        for (let [key, value] of this.langEnv!.fileExtensions) {
            if (value === extension) return key;
        }
        return "";
    }
}
