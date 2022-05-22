import { editorEnvironment } from "../config/WebappConfiguration";
import { PiCompositeProjection, PiError, PiLogger, Searcher } from "@projectit/core";
import type { PiElement } from "@projectit/core";
import { activeTab, errorsLoaded, errorTab, searchResultLoaded, searchResults, searchTab } from "../components/stores/InfoPanelStore";
import { EditorState } from "./EditorState";

const LOGGER = new PiLogger("EditorRequestsHandler"); // .mute();

export class EditorRequestsHandler {
    private static instance: EditorRequestsHandler = null;
    static getInstance(): EditorRequestsHandler {
        if (EditorRequestsHandler.instance === null) {
            EditorRequestsHandler.instance = new EditorRequestsHandler();
        }
        return EditorRequestsHandler.instance;
    }

    /**
     * Makes sure that the editor show the current unit using the projections selected by the user
     * @param name
     */
    enableProjection(name: string): void {
        LOGGER.log("enabling Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.enableProjection(name);
        }
    }

    /**
     * Makes sure that the editor show the current unit using the projections selected or unselected by the user
     * @param name
     */
    disableProjection(name: string): void {
        LOGGER.log("disabling Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.disableProjection(name);
        }
    }

    redo() {
        // TODO implement redo()
        LOGGER.log("redo called");
        return undefined;
    }

    undo() {
        // TODO implement undo()
        LOGGER.log("undo called");
        return undefined;
    }

    validate() {
        LOGGER.log("validate called");
        errorsLoaded.set(false);
        activeTab.set(errorTab);
        EditorState.getInstance().getErrors();
        errorsLoaded.set(true);
    }

    replace() {
        // TODO implement replace()
        LOGGER.log("replace called");
        return undefined;
    }

    findText(stringToFind: string) {
        // todo loading of errors and search results should also depend on whether something has changed in the unit shown
        LOGGER.log("findText called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new Searcher();
        const results: PiElement[] = searcher.findString(stringToFind, EditorState.getInstance().currentUnit, editorEnvironment.writer);
        this.showSearchResults(results, stringToFind);
    }

    findStructure(elemToMatch: Partial<PiElement>) {
        LOGGER.log("findStructure called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new Searcher();
        const results: PiElement[] = searcher.findStructure(elemToMatch, EditorState.getInstance().currentUnit);
        this.showSearchResults(results, "elemToMatch");
    }

    findNamedElement(nameToFind: string, metatypeSelected: string){
        LOGGER.log("findNamedElement called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new Searcher();
        const results: PiElement[] = searcher.findNamedElement(nameToFind, EditorState.getInstance().currentUnit, metatypeSelected);
        this.showSearchResults(results, nameToFind);
    }

    private showSearchResults(results: PiElement[], stringToFind: string) {
        const itemsToShow: PiError[] = [];
        if (!results || results.length === 0) {
            itemsToShow.push(new PiError("No results for " + stringToFind, null, ""));
        } else {
            for (const elem of results) {
                // message: string, element: PiElement | PiElement[], locationdescription: string, severity?: PiErrorSeverity
                // todo show some part of the text string instead of the element id
                itemsToShow.push(new PiError(elem.piId(), elem, elem.piId()));
            }
        }
        searchResults.set(itemsToShow);
        searchResultLoaded.set(true);
    }
}
