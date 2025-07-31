import {
    FreProjectionHandler,
    FreError,
    FreLogger,
    FreSearcher,
    type FreEnvironment,
    AstActionExecutor,
    type FreModelUnit,
    isRtError,
    isNullOrUndefined,
    notNullOrUndefined,
    FreErrorSeverity,
    FreEditorUtil,
    FreDelta
} from '@freon4dsl/core';
import type { FreNode, TraceNode } from "@freon4dsl/core";
import { runInAction } from "mobx";
import {
    activeTab,
    errorsLoading,
    errorTab, interpreterResultLoading, interpreterTab, interpreterTrace,
    modelErrors,
    searchResultLoading,
    searchResults,
    searchTab
} from "../stores/InfoPanelStore.svelte"
import { WebappConfigurator } from "../language/index.js";
import { editorInfo, infoPanelShown, setUserMessage, userMessageOpen } from "../stores/index.js"
import { TreeNodeData } from "../tree/TreeNodeData.js"

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
        // console.log("enabling Projection " + names);
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

    saveModel = async (): Promise<void> => {
        await WebappConfigurator.getInstance().saveModel();
        if (userMessageOpen.value) {
            return
        }
        setUserMessage(`Model '${editorInfo.modelName}' saved.`, FreErrorSeverity.Info);
    }

    redo = (): void => {
        const delta: FreDelta | undefined = AstActionExecutor.getInstance(this.langEnv!.editor).redo();
        // TODO TEST
        if (delta !== undefined && !this.langEnv!.editor.isBoxInTree(this.langEnv!.editor.selectedBox)) {
            FreEditorUtil.selectAfterUndo(this.langEnv!.editor, delta)
        }
        this.langEnv!.editor.selectionChanged()
    }

    undo = (): void => {
        const delta: FreDelta | undefined = AstActionExecutor.getInstance(this.langEnv!.editor).undo();
        console.log(`undo delta '${delta?.toString()}'`)
        // TODO TEST
        if (delta !== undefined && !this.langEnv!.editor.isBoxInTree(this.langEnv!.editor.selectedBox)) {
            FreEditorUtil.selectAfterUndo(this.langEnv!.editor, delta)
        }
        // todo do we need to warn the user if the delta is undefined?
        this.langEnv!.editor.selectionChanged()
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
        // console.log("validate called");
        errorsLoading.value = true;
        activeTab.value = errorTab;
        infoPanelShown.value = true;
        WebappConfigurator.getInstance().getErrors();
        // console.log("Errors: " + modelErrors.list.map(err => err.message).join("\n"));
        errorsLoading.value = false;
        if (!isNullOrUndefined(modelErrors.list[0])) {
            const nodes: FreNode | FreNode[] = modelErrors.list[0].reportedOn;
            if (Array.isArray(nodes)) {
                WebappConfigurator.getInstance().selectElement(nodes[0]);
            } else {
                WebappConfigurator.getInstance().selectElement(nodes);
            }
        }
    }

    interpret = (): void => {
        // console.log("interpret: called");
        interpreterResultLoading.value = true;
        activeTab.value = interpreterTab;
        infoPanelShown.value = true;
        const langEnv : FreEnvironment = WebappConfigurator.getInstance().langEnv!;
        const intp = langEnv?.interpreter;
        if (langEnv && intp) {
            intp.setTracing(true)
            const node: FreNode = langEnv.editor.selectedElement

            const value = intp.evaluate(node)
            if (isRtError(value)) {
                interpreterTrace.value = new TreeNodeData(value.toString())
                // console.log(value.toString())
            } else {
                const trace = intp.getTrace().root
                // console.log(trace.toStringRecursive())
                interpreterTrace.value = this.makeTreeNode(trace)
            }
        } else {
            interpreterTrace.value = new TreeNodeData("No interpreter found")
        }
        interpreterResultLoading.value = false;
    }

    private makeTreeNode(trace: TraceNode): TreeNodeData {
        const name: string = trace.toResultString();
        if (trace.children && trace.children.length > 0) {
            const children: TreeNodeData[] = [];
            for (const child of trace.children) {
                children.push(this.makeTreeNode(child));
            }
            // todo remove the type cast when TraceNode has changed its signature
            return new TreeNodeData(name, trace.node as FreNode, children);
        } else {
            return new TreeNodeData(name, trace.node as FreNode, undefined);
        }
    }

    findText(stringToFind: string) {
        // todo loading of errors and search results should also depend on whether something has changed in the unit shown
        // console.log("findText called: " + stringToFind);
        searchResultLoading.value = true;
        searchResults.list = [];
        activeTab.value = searchTab;
        const searcher = new FreSearcher();
        if (notNullOrUndefined(editorInfo.currentUnit)) {
            // console.log('has current unit')
            const unit: FreModelUnit | undefined = WebappConfigurator.getInstance().getUnit(editorInfo.currentUnit);
            if (notNullOrUndefined(unit)) {
                // console.log('found unit')
                const results: FreNode[] = searcher.findString(
                    stringToFind,
                    unit,
                    WebappConfigurator.getInstance().langEnv!.writer!
                )
                // console.log(results);
                this.showSearchResults(results, stringToFind);
            }
        }
        searchResultLoading.value = false;
    }

    private showSearchResults(results: FreNode[], stringToFind: string) {
        const itemsToShow: FreError[] = [];
        if (!results || results.length === 0) {
            itemsToShow.push(new FreError("No results for " + stringToFind, results[0], "", ""));
        } else {
            for (const elem of results) {
                // todo show some part of the text string instead of the element id
                itemsToShow.push(new FreError(elem.freId(), elem, elem.freId(), ""));
            }
        }
        searchResults.list = itemsToShow;

        infoPanelShown.value = true;
        // console.log(`showSearchResults: ${searchResultLoading.value}, ${infoPanelShown.value}, ${searchResults.list.map(it => it.message).join("\n")}`);
    }

    // todo to be added: findStructure based on a partial FreNode
    // findStructure(elemToMatch: Partial<FreNode>) {
    //     LOGGER.log("findStructure called");
    //     searchResultLoaded.value = false;
    //     activeTab.value = searchTab;
    //     const searcher = new FreSearcher();
    //     const results: FreNode[] = searcher.findStructure(elemToMatch, EditorState.getInstance().currentUnit!);
    //     this.showSearchResults(results, "elemToMatch");
    // }

    findNamedElement(nameToFind: string, metatypeSelected: string) {
        LOGGER.log("findNamedElement called");
        searchResultLoading.value = true;
        activeTab.value = searchTab;
        const searcher = new FreSearcher();
        const unit = WebappConfigurator.getInstance().getUnit(editorInfo.currentUnit!);
        if (unit) {
            const results: FreNode[] = searcher.findNamedElement(
              nameToFind,
              unit,
              metatypeSelected
            );
            this.showSearchResults(results, nameToFind);
        }
        searchResultLoading.value = false;
    }
}
