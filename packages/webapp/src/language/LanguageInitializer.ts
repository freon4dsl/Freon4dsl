import { conceptNames, fileExtensions, languageName, projectionNames, unitTypes } from "../components/stores/LanguageStore";
import { editorEnvironment } from "../config/WebappConfiguration";
import { PiCompositeProjection } from "@projectit/core";

export class LanguageInitializer {

    /**
     * fills the Webapp Stores with initial values that describe the language
     */
    static initialize(): void {
        languageName.set(editorEnvironment.languageName);
        // unitTypes are the same for every model in the language
        unitTypes.set(editorEnvironment.unitNames);
        // file extensions are the same for every model in the language
        const tmp: string[] = [];
        for (const val of editorEnvironment.fileExtensions.values()) {
            tmp.push(val);
        }
        fileExtensions.set(tmp);
        // projectionNames are the same for every model in the language
        const proj = editorEnvironment.editor.projection;
        let nameList: string[] = proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name];
        projectionNames.set(nameList);
        // set the concept names for which a search is possible
        conceptNames.set(["Attr", "Mthod"]);
        // TODO conceptNames.set(editorEnvironment.conceptNames);
    }
}
