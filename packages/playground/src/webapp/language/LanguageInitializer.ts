import {
    conceptNames,
    fileExtensions,
    languageName,
    projectionNames,
    projectionsShown,
    unitTypes
} from "../components/stores/LanguageStore";
import { editorEnvironment } from "../config/WebappConfiguration";
import { PiCompositeProjection } from "@projectit/core";

export class LanguageInitializer {

    /**
     * fills the Webapp Stores with initial values that describe the language
     */
    static initialize(): void {
        // the language name
        languageName.set(editorEnvironment.languageName);

        // the names of the unit types
        unitTypes.set(editorEnvironment.unitNames);

        // the file extensions for all unit types
        // because 'editorEnvironment.fileExtensions.values()' is not an Array but an IterableIterator,
        // we transfer the valuew to a tmp array.
        const tmp: string[] = [];
        for (const val of editorEnvironment.fileExtensions.values()) {
            tmp.push(val);
        }
        fileExtensions.set(tmp);

        // the names of the projections / views
        const proj = editorEnvironment.editor.projection;
        let nameList: string[] = proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name];
        projectionNames.set(nameList);
        projectionsShown.set(nameList); // initialy, all projections are shown

        // the concept names for which a search is possible
        conceptNames.set(["Attr", "Mthod"]);
        // TODO conceptNames.set(editorEnvironment.conceptNames);
    }
}
