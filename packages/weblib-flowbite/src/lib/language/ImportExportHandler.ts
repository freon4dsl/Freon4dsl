import { type FreEnvironment, type FreModelUnit, type FreUnitIdentifier, isNullOrUndefined } from '@freon4dsl/core';
import {WebappConfigurator} from "$lib/language/WebappConfigurator";
import {progressIndicatorShown, setUserMessage} from "$lib";

export class ImportExportHandler {
    private langEnv: FreEnvironment | undefined = WebappConfigurator.getInstance().langEnv;

    importUnits(fileList: FileList | File[]) {
        if (WebappConfigurator.getInstance().langEnv) {
            this.langEnv = WebappConfigurator.getInstance().langEnv;
            progressIndicatorShown.value = true;
            let showIt: boolean = true; // only show the first of the imported units
            for (const file of fileList) {
                this.readSingleFile(file, showIt);
                showIt = false;
            }
            progressIndicatorShown.value = false;
        }
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
                            WebappConfigurator.getInstance().unitFromFile(
                                filename,
                                reader.result as string,
                                metaType,
                                showIt,
                            );
                        }
                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            setUserMessage(`${e.message}`);
                        } else {
                            setUserMessage("Unknown error while importing file")
                        }
                    }
                }
            };
            reader.onerror = function () {
                setUserMessage(reader.error ? reader.error.message : '');
            };
        } else {
            setUserMessage(`File ${file.name} does not have the right (extension) type.
                 Found: ${extension}, expected one of: ${this.allExtensionsToString()}.`);
        }
    }

    async exportUnit(unitId: FreUnitIdentifier) {
        if (WebappConfigurator.getInstance().langEnv) {
            this.langEnv = WebappConfigurator.getInstance().langEnv;
            // get the complete unit from the server
            const unit: FreModelUnit | undefined = WebappConfigurator.getInstance().getUnit(unitId);
            if (unit) this._exportUnit(unit);
        } else {
            console.error('exportUnit: No language environment')
        }
        // console.log("Exporting done")
    }

    private _exportUnit(unit: FreModelUnit) {
        // console.log("Exporting unit ", unit.name)
        // do not try to export a unit with errors, parsing and unparsing will not proceed correctly
        const list = this.langEnv?.validator.validate(unit);
        if (!isNullOrUndefined(list) && list.length > 0) {
            setUserMessage(`Cannot export unit '${unit.name}', because it has errors (found ${list.length}).`);
            // console.log("Not exporting because of errors: " + list.map((l) => l.message).join(", "));
            return;
        }
        // create a text string from the unit
        const text: string = this.langEnv!.writer.writeToString(unit);

        // get the default file name from the unit
        const fileExtension: string | undefined = this.langEnv!.fileExtensions.get(unit.freLanguageConcept());
        const defaultFileName: string = unit.name + "." + fileExtension;

        // create an HTML element that contains the text string
        let textFile = null;
        const data = new Blob([text], {type: "text/plain"});

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
            const event = new MouseEvent("click");
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
        // setUserMessage(`Unit '${unit.name}' exported to file ${defaultFileName}.`);
    }

    private allExtensionsToString(): string {
        let result: string = "";
        const size: number = this.langEnv!.fileExtensions.size;
        let i: number = 0;
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        for (const [key, value] of this.langEnv!.fileExtensions) {
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
        for (const [key, value] of this.langEnv!.fileExtensions) {
            if (value === extension) return key;
        }
        return "";
    }
}
