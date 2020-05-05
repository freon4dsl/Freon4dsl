// This file contains all the stuff that needs to connect to the projectIt generated langauge environment
import { Tooltip } from "@fluentui/react-northstar";
import { PiCompositeProjection, ProjectionalEditor } from "@projectit/core";
import * as React from "react";

import { environment } from "./Environment";
import { ServerCommunication } from "./ServerCommunication";

export interface IModelUnit {
    id: number;
    name: string;
    language: string;
    // TODO check whether the url is useful
    url?: string;
}

export interface IErrorItem {
    key: number | string;
    errormessage: string;
    errorlocation: string;
}

export class EditorEnvironment {
    // for the communication with the editor
    static getEditor(): ProjectionalEditor {
        return environment.projectionalEditorComponent;
    }

    // for the communication with the menubar
    static new() {
        console.log("EditorEnvironment new called");
    }

    static save() {
        console.log("EditorEnvironment save called");
    }

    static saveAs(newValue: string) {
        console.log("EditorEnvironment save as called, new name: " + newValue);
        ServerCommunication.putModel(newValue);
    }

    static redo() {
        return undefined;
    }

    static undo() {
        return undefined;
    }
    // END OF: for the communication with the menubar

    // for the communication with the navigator:
    static getModelUnits(): IModelUnit[] {
        return this.mockModelUnits();
    }

    static changeToModelUnit(id: number) {
        console.log("Editor should be changed to show model unit with id '" + id + "', and error list should be emptied");
    }

    static mockModelUnits(): IModelUnit[] {
        let myList: IModelUnit[] = [];

        for (let i = 0; i < 5; i++) {
            let url = "http://server/modelUnit" + i;
            myList.push({
                id: i,
                name: "modelUnit" + i,
                language: "DemoLanguage",
                url: url
            });
        }
        for (let i = 5; i < 8; i++) {
            let url = "http://server/modelUnit" + i;
            myList.push({
                id: i,
                name: "modelUnit" + i,
                language: "TaxRules",
                url: url
            });
        }
        for (let i = 8; i < 11; i++) {
            let url = "http://server/modelUnit" + i;
            myList.push({
                id: i,
                name: "modelUnit" + i,
                language: "DemoLanguage",
                url: url
            });
        }
        return myList;
    }
    // END OF: for the communication with the navigator

    // for the communication with the error list:
    static errorSelected(error: IErrorItem) {
        console.log("Error selected: '" + error.errormessage + "', location:  '" + error.errorlocation + "'");
    }

    static getErrors(): IErrorItem[] {
        let myList: IErrorItem[] = [];
        myList.push({
            key: 0,
            errormessage: "This is an error from ProjectIt",
            errorlocation: "somewhere in the editor"
        });
        for (let i = 1; i < 25; i++) {
            myList.push({
                key: i,
                errormessage: EditorEnvironment.mockErrors(),
                errorlocation: EditorEnvironment.mockErrors()
            });
        }
        return myList;
    }

    // the following sets the content of the errorlist items and can be removed when the errors are observable
    static LOREM_IPSUM = (
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut " +
        "labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut "
    ).split(" ");
    static loremIndex = 0;

    static mockErrors(): string {
        let wordCount = 4;
        const startIndex = this.loremIndex + wordCount > this.LOREM_IPSUM.length ? 0 : this.loremIndex;
        this.loremIndex = startIndex + wordCount;
        return this.LOREM_IPSUM.slice(startIndex, this.loremIndex).join(" ");
    }
    // END OF: the following sets the content of the errorlist items and can be removed when the errors are observable
    // END OF: for the communication with the error list

    static getProjectionNames(): string[] {
        return environment.projection.projectionNames();
    }

    static setProjection(name: string): void {
        environment.projection.projectiontoFront(name);
    }
}
