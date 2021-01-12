// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { ProjectionalEditor, PiError } from "@projectit/core";
import * as React from "react";



// TODO see if we want to use this interface
export interface IEditorCommunication {

    getEditor(): ProjectionalEditor;
    newModel();
    open(name: string);
    save() ;
    saveAs(newName: string);
    deleteCurrentModel() ;
    getModelUnits(modelListCallback: (names: string[]) => void);
    errorSelected(error: PiError);
    getErrors();
    getProjectionNames(): string[];
    setProjection(name: string): void;
    redo();
    undo();
}

