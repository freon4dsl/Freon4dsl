<script lang="ts">
    /**
     * This component shows a complete projection, by displaying the rootbox of
     * the associated editor.
     */
    import {
        FreEditor,
        FreLogger,
        Box,
        ARROW_UP,
        ARROW_DOWN,
        TAB,
        BACKSPACE,
        ARROW_LEFT,
        DELETE,
        ENTER,
        ARROW_RIGHT, isNullOrUndefined, isTableRowBox, isElementBox
    } from "@freon4dsl/core"
    import RenderComponent from "./RenderComponent.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import { afterUpdate, onMount, tick } from "svelte";
    import { contextMenu, contextMenuVisible, selectedBoxes, viewport, componentId } from "./svelte-utils/index.js";

    let LOGGER = new FreLogger("FreonComponent");//.mute();
    export let editor: FreEditor;
    let element: HTMLDivElement; // The current main element of this component.
    let rootBox: Box;
    let id: string;              // an id for the html element showing the rootBox
    id = !!rootBox ? componentId(rootBox) : "freon-component-with-unknown-box";

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("FreonComponent onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey + " shift: " + event.shiftKey);
        // if (event.ctrlKey) {
        //     if (!event.altKey) {
        //         if (event.key === 'z') { // ctrl-z
        //             // todo UNDO
        //         } else if (event.key === 'h') { // ctrl-h
        //             // todo SEARCH
        //             event.stopPropagation();
        //         } else if (event.key === 'y') { // ctrl-y
        //             // todo REDO
        //             event.stopPropagation();
        //         } else if (event.key === 'x') { // ctrl-x
        //             // todo CUT
        //             event.stopPropagation();
        //         } else if (event.key === 'x') { // ctrl-a
        //             // todo SELECT ALL in focused control
        //             event.stopPropagation();
        //         } else if (event.key === 'c') { // ctrl-c
        //             // todo COPY
        //         } else if (event.key === 'v') { // ctrl-v
        //             // todo PASTE
        //         }
        //     }
        //     if (event.key === 'z') { // ctrl-alt-z
        //         // todo REDO
        //     }
        // } else {
        //     if (event.altKey && event.key === BACKSPACE) { // alt-backspace
        //         // TODO UNDO
        //     } else if (!event.ctrlKey && event.altKey && event.shiftKey) { // alt-shift-backspace
        //         // TODO REDO
        //     }
        // }
        if (event.ctrlKey || event.altKey) {
            switch (event.key) {
                case ARROW_UP: // ctrl-arrow-up or alt-arrow-up
                    editor.selectParent();
                    stopEvent(event);
                    break;
                case ARROW_DOWN: // ctrl-arrow-down or alt-arrow-down
                    editor.selectFirstLeafChildBox();
                    stopEvent(event);
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.key) {
                case TAB: // shift-tab
                    editor.selectPreviousLeaf();
                    stopEvent(event);
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            // No meta key pressed
            switch (event.key) {
                case BACKSPACE:
                case ARROW_LEFT:
                    editor.selectPreviousLeafIncludingExpressionPreOrPost();
                    stopEvent(event);
                    break;
                case DELETE:
                    LOGGER.log("FreonComponent - DELETE")
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case TAB:
                case ENTER:
                    editor.selectNextLeaf();
                    stopEvent(event);
                    break;
                case ARROW_RIGHT:
                    editor.selectNextLeafIncludingExpressionPreOrPost();
                    stopEvent(event);
                    break;
                case ARROW_DOWN:
                    editor.selectBoxBelow(editor.selectedBox);
                    stopEvent(event);
                    break;
                case ARROW_UP:
                    editor.selectBoxAbove(editor.selectedBox);
                    stopEvent(event);
                    break;
            }
        }
    };

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where boxes are
     * in relationship with each other.
     */
    function onScroll() {
        // Hide any contextmenu upon scrolling, because its position will not be correct.
        $contextMenuVisible = false;
        // we use a timeOut here, like below in the ResizeObserver, to improve performance
        setTimeout(() => {
            editor.scrollX = element.scrollLeft;
            editor.scrollY = element.scrollTop;
        }, 400); // Might use another value for the delay, but this seems ok.
    }

    function setViewportSizes(elem: Element) {
        // Note that entry.contentRect gives slightly different results to entry.target.getBoundingClientRect().
        // A: I have no idea why.
        if (!!elem) {
            let rect = elem.getBoundingClientRect();
            if (!!elem.parentElement) {
                let parentRect = elem.parentElement.getBoundingClientRect();
                $viewport.setSizes(rect.height, rect.width, parentRect.top, parentRect.left);
            } else {
                $viewport.setSizes(rect.height, rect.width, 0, 0);
            }
        }
    }

    onMount(() => {
        setViewportSizes(element);

        // We keep track of the size of the editor component, to be able to position any context menu correctly.
        // For this we use a ResizeObserver.

        // Define the observer and its callback.
        const resizeObserver = new ResizeObserver(entries => {
            // Hide any contextmenu upon resize, because its position will not be correct.
            $contextMenuVisible = false;
            // Use a timeOut to improve performance, otherwise every slight change will activate this function.
            setTimeout(() => {
                // We're only watching one element, this is the first of the entries. Get it's size.
                setViewportSizes(entries.at(0).target);
            }, 400); // Might use another value for the delay, but this seems ok.
        });

        // Observe the FreonComponent element.
        resizeObserver.observe(element);
        editor.refreshComponentSelection = refreshSelection
        editor.refreshComponentRootBox= refreshRootBox;

        // This callback cleans up the observer.
        return () => resizeObserver.unobserve(element);
    });

    afterUpdate( () => {
        editor.refreshComponentSelection = refreshSelection
        editor.refreshComponentRootBox= refreshRootBox;
        setViewportSizes(element);
    } );

    const refreshSelection = async  (why?: string) => {
        LOGGER.log("FreonComponent.refreshSelection: " + why + " editor selectedBox is " + editor?.selectedBox?.kind);
        if (!isNullOrUndefined(editor.selectedBox) && !$selectedBoxes.includes(editor.selectedBox)) { // selection is no longer in sync with editor
            await tick();
            $selectedBoxes = getSelectableChildren(editor.selectedBox);
            editor.selectedBox.setFocus();
        }
    };

    function getSelectableChildren(box: Box): Box[] {
        const result: Box[] = [];
        // Because neither a TableRowBox nor an ElementBox has its own HTML equivalent,
        // its children are regarded to be selected.
        if (isTableRowBox(box) ) {
            for (const child of box.children) {
                result.push(...getSelectableChildren(child));
            }
        } else if (isElementBox(box)) {
            result.push(...getSelectableChildren(box.content));
        } else {
            result.push(box);
        }
        return result;
    }

    const refreshRootBox = (why?: string) => {
        rootBox = editor.rootBox;
        LOGGER.log("REFRESH " + why + " ==================> FreonComponent with rootbox " + rootBox?.id + " unit " + (!!(rootBox?.node) ? rootBox.node["name"] : "undefined"));
    };

    refreshRootBox("Initialize FreonComponent");
    refreshSelection("Initialize FreonComponent");
</script>

<!-- include the material design styling -->
<svelte:head>
    <link href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css" rel="stylesheet"/>
    <script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
    
</svelte:head>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
<div class={"freon-component"}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
     id="{id}"
     role="group"
>
    <div class="gutter"></div>
    <div class="editor-component">
    <RenderComponent editor={editor}
                     box={rootBox}
    />
    </div>
</div>
<!-- Here the only instance of ContextMenu is defined -->
<!-- TODO make some default items for the context menu -->
<ContextMenu bind:this={$contextMenu} items={[]} editor={editor}/>
