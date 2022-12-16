import { editorEnvironment } from "../config/WebappConfiguration";
import {
    Box, FreProjectionHandler,
    isActionBox,
    isActionTextBox, isListBox, Language,
    PiError,
    PiLogger,
    PiUndoManager,
    Searcher,
    SeverityType
} from "@projectit/core";
import type { PiElement } from "@projectit/core";
import { activeTab, errorsLoaded, errorTab, searchResultLoaded, searchResults, searchTab } from "../components/stores/InfoPanelStore";
import { EditorState } from "./EditorState";
import { setUserMessage } from "../components/stores/UserMessageStore";

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
    enableProjections(names: string[]): void {
        LOGGER.log("enabling Projection " + names);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof FreProjectionHandler) {
            proj.enableProjections(names);
        }
    }

    /**
     * Makes sure that the editor shows the current unit using the projections selected or unselected by the user
     * @param name
     */
    // disableProjection(name: string): void {
    //     LOGGER.log("disabling Projection " + name);
    //     const proj = editorEnvironment.editor.projection;
    //     if (proj instanceof FreProjectionHandler) {
    //         proj.disableProjection(name);
    //     }
    // }

    redo() {
        const unitInEditor = EditorState.getInstance().currentUnit;
        console.log("redo called: " + PiUndoManager.getInstance().nextRedoAsText(unitInEditor));
        if (!!unitInEditor) {
            PiUndoManager.getInstance().executeRedo(unitInEditor);
        }
    }

    undo() {
        const unitInEditor = EditorState.getInstance().currentUnit;
        LOGGER.log("undo called: " + PiUndoManager.getInstance().nextUndoAsText(unitInEditor));
        if (!!unitInEditor) {
            PiUndoManager.getInstance().executeUndo(unitInEditor);
        }
    }

    cut() {
        LOGGER.log("cut called");
        const tobecut: PiElement = editorEnvironment.editor.selectedItem;
        if (!!tobecut) {
            EditorState.getInstance().deleteElement(tobecut);
            editorEnvironment.editor.copiedElement = tobecut;
            // console.log("element " + editorEnvironment.editor.copiedElement.piId() + " is stored ");
        } else {
            setUserMessage("Nothing selected", SeverityType.warning);
        }
    }

    copy() {
        LOGGER.log("copy called");
        const tobecopied: PiElement = editorEnvironment.editor.selectedItem;
        if (!!tobecopied) {
            editorEnvironment.editor.copiedElement = tobecopied.copy();
            // console.log("element " + editorEnvironment.editor.copiedElement.piId() + " is stored ");
        } else {
            setUserMessage("Nothing selected", SeverityType.warning);
        }
    }

    paste() {
        LOGGER.log("paste called");
        const tobepasted = editorEnvironment.editor.copiedElement;
        if (!!tobepasted) {
            const currentSelection: Box = editorEnvironment.editor.selectedBox;
            const element: PiElement = currentSelection.element;
            if (!!currentSelection) {
                if (isActionTextBox(currentSelection)) {
                    if (isActionBox(currentSelection.parent)) {
                        if (Language.getInstance().metaConformsToType(tobepasted, currentSelection.parent.conceptName)) { // allow subtypes
                            // console.log("found text box for " + currentSelection.parent.conceptName + ", " + currentSelection.parent.propertyName);
                            EditorState.getInstance().pasteInElement(element, currentSelection.parent.propertyName )
                        } else {
                            setUserMessage("Cannot paste an " + tobepasted.piLanguageConcept() + " here.", SeverityType.warning);
                        }
                    }
                } else if (isListBox(currentSelection.parent)) {
                    if (Language.getInstance().metaConformsToType(tobepasted, element.piLanguageConcept())) { // allow subtypes
                        // console.log('pasting in ' + currentSelection.role + ', prop: ' + currentSelection.parent.propertyName);
                        EditorState.getInstance().pasteInElement(element.piOwnerDescriptor().owner, currentSelection.parent.propertyName, element.piOwnerDescriptor().propertyIndex + 1);
                    } else {
                        setUserMessage("Cannot paste an " + tobepasted.piLanguageConcept() + " here.", SeverityType.warning);
                    }
                } else {
                    // todo other pasting options ...
                }
            } else {
                setUserMessage("Cannot paste an " + tobepasted.piLanguageConcept() + " here.", SeverityType.warning);
            }
        } else {
            setUserMessage("Nothing to be pasted", SeverityType.warning);
            return;
        }
    }

    validate() {
        LOGGER.log("validate called");
        errorsLoaded.set(false);
        activeTab.set(errorTab);
        EditorState.getInstance().getErrors();
        errorsLoaded.set(true);
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

    findNamedElement(nameToFind: string, metatypeSelected: string) {
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
