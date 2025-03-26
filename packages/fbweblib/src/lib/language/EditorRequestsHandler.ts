import {
    FreProjectionHandler,
    FreError,
    FreLogger,
    FreSearcher,
    type FreEnvironment,
    AstActionExecutor, type FreModelUnit
} from "@freon4dsl/core"
import type { FreNode } from "@freon4dsl/core";
import { runInAction } from "mobx";
import {
    activeTab,
    errorsLoaded,
    errorTab,
    modelErrors,
    searchResultLoaded,
    searchResults,
    searchTab,
} from "$lib/stores/InfoPanelStore.svelte";
import { WebappConfigurator } from "$lib/language";
import { editorInfo, infoPanel } from "$lib"

const LOGGER = new FreLogger("EditorRequestsHandler"); // .mute();

export class EditorRequestsHandler {
    private static instance: EditorRequestsHandler | null = null;

    static getInstance(): EditorRequestsHandler {
        if (EditorRequestsHandler.instance === null) {
            EditorRequestsHandler.instance = new EditorRequestsHandler();
        }
        return EditorRequestsHandler.instance;
    }

    private langEnv: FreEnvironment | undefined = WebappConfigurator.getInstance().langEnv;

    /**
     * Makes sure that the editor shows the current unit using the projections selected by the user
     * @param names
     */
    enableProjections(names: string[]): void {
        console.log("enabling Projection " + names);
        const proj: FreProjectionHandler | undefined = this.langEnv?.editor.projection;
        if (proj instanceof FreProjectionHandler) {
            proj.enableProjections(names);
        }
        // Let the editor know that the projections have changed.
        // TODO: This should go automatically through mobx.
        //       But observing the projections array does not work as expected.
        runInAction( () => {
            if (this.langEnv?.editor) {
                this.langEnv.editor.forceRecalculateProjection++;
            }
        })
        // redo the validation to set the errors in the new box tree
        // todo reinstate the following statement
        // this.validate();
    }

    redo = (): void => {
        AstActionExecutor.getInstance(this.langEnv!.editor).redo();
    }

    undo = (): void => {
        AstActionExecutor.getInstance(this.langEnv!.editor).undo();
    }

    cut = (): void => {
        AstActionExecutor.getInstance(this.langEnv!.editor).cut();
    }

    copy = (): void => {
        AstActionExecutor.getInstance(this.langEnv!.editor).copy();
    }

    paste = (): void => {
        AstActionExecutor.getInstance(this.langEnv!.editor).paste();
    }

    validate = (): void => {
        console.log("validate called");
        // errorsLoaded.value = false;
        // activeTab.value = errorTab;
        WebappConfigurator.getInstance().getErrors();
        // errorsLoaded.value = true;
        // if (!!modelErrors.list[0]) {
        //     const nodes: FreNode | FreNode[] = modelErrors.list[0].reportedOn;
        //     if (Array.isArray(nodes)) {
        //         EditorState.getInstance().selectElement(nodes[0]);
        //     } else {
        //         EditorState.getInstance().selectElement(nodes);
        //     }
        // }
    }

    interpret = (): void => {
        console.log("interpret: called");
    }

    findText(stringToFind: string) {
        // todo loading of errors and search results should also depend on whether something has changed in the unit shown
        console.log("findText called: " + stringToFind);
        searchResultLoaded.value = false;
        activeTab.value = searchTab;
        const searcher = new FreSearcher();
        if (!!editorInfo.currentUnit) {
            console.log('has current unit')
            const unit: FreModelUnit | undefined = WebappConfigurator.getInstance().getUnit(editorInfo.currentUnit);
            if (!!unit) {
                console.log('found unit')
                const results: FreNode[] = searcher.findString(
                    stringToFind,
                    unit,
                    WebappConfigurator.getInstance().langEnv?.writer!
                )
                console.log(results);
                this.showSearchResults(results, stringToFind);
            }
        }
    }

    private showSearchResults(results: FreNode[], stringToFind: string) {
        const itemsToShow: FreError[] = [];
        if (!results || results.length === 0) {
            // @ts-ignore
            itemsToShow.push(new FreError("No results for " + stringToFind, null, "", ""));
        } else {
            for (const elem of results) {
                // message: string, element: FreNode | FreNode[], locationdescription: string, severity?: FreErrorSeverity
                // todo show some part of the text string instead of the element id
                itemsToShow.push(new FreError(elem.freId(), elem, elem.freId(), ""));
            }
        }
        searchResults.list = itemsToShow;
        searchResultLoaded.value = true;
        infoPanel.value = true;
    }

    // findStructure(elemToMatch: Partial<FreNode>) {
    //     LOGGER.log("findStructure called");
    //     searchResultLoaded.value = false;
    //     activeTab.value = searchTab;
    //     const searcher = new FreSearcher();
    //     const results: FreNode[] = searcher.findStructure(elemToMatch, EditorState.getInstance().currentUnit!);
    //     this.showSearchResults(results, "elemToMatch");
    // }
    //
    // findNamedElement(nameToFind: string, metatypeSelected: string) {
    //     LOGGER.log("findNamedElement called");
    //     searchResultLoaded.value = false;
    //     activeTab.value = searchTab;
    //     const searcher = new FreSearcher();
    //     const results: FreNode[] = searcher.findNamedElement(
    //         nameToFind,
    //         EditorState.getInstance().currentUnit!,
    //         metatypeSelected,
    //     );
    //     this.showSearchResults(results, nameToFind);
    // }
    //
    // private showSearchResults(results: FreNode[], stringToFind: string) {
    //     const itemsToShow: FreError[] = [];
    //     if (!results || results.length === 0) {
    //         // @ts-ignore
    //         itemsToShow.push(new FreError("No results for " + stringToFind, null, "", ""));
    //     } else {
    //         for (const elem of results) {
    //             // message: string, element: FreNode | FreNode[], locationdescription: string, severity?: FreErrorSeverity
    //             // todo show some part of the text string instead of the element id
    //             itemsToShow.push(new FreError(elem.freId(), elem, elem.freId(), ""));
    //         }
    //     }
    //     searchResults.list = itemsToShow;
    //     searchResultLoaded.value = true;
    // }
}
