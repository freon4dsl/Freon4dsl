<script lang="ts">
    import { FREON_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a complete projection, by displaying the root box of
     * the associated editor.
     */
    import {
        type Box,
        ARROW_UP,
        ARROW_DOWN,
        TAB,
        BACKSPACE,
        ARROW_LEFT,
        DELETE,
        ENTER,
        ARROW_RIGHT,
        notNullOrUndefined,
        isTableRowBox,
        isElementBox,
        AstActionExecutor,
        type FreNode, type ClientRectangle, UndefinedRectangle, FreEditorUtil, isNullOrUndefined
    } from '@freon4dsl/core';
    import RenderComponent from './RenderComponent.svelte';
    import ContextMenu from './ContextMenu.svelte';
    import { tick } from 'svelte';
    import { componentId, dummyBox } from './svelte-utils/index.js';
    import {
        contextMenu,
        contextMenuVisible,
        selectedBoxes,
        shouldBeHandledByBrowser
    } from './stores/AllStores.svelte.js';
    import type { MainComponentProps } from './svelte-utils/FreComponentProps.js';
    import { getNearestScrollContainer } from './svelte-utils/ScrollingUtils';
    import { type PaneLike, providePaneContext } from './svelte-utils/PaneLike';

    let LOGGER = FREON_LOGGER;

    let { editor }: MainComponentProps = $props();

    let freonRootElement: HTMLDivElement | undefined = $state(undefined); // The current main element of this component.
    let rootBox: Box = $state(dummyBox);
    let id: string = $derived(
        // an id for the html element showing the rootBox
        rootBox && rootBox !== dummyBox ? componentId(rootBox) : 'freon-component-with-unknown-box'
    );

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        shouldBeHandledByBrowser.value = false;
    }

    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log(
            'FreonComponent onKeyDown: ' +
                event.key +
                ' ctrl: ' +
                event.ctrlKey +
                ' alt: ' +
                event.altKey +
                ' shift: ' +
                event.shiftKey
        );
        if (event.ctrlKey) {
            if (!event.altKey) {
                switch (event.key) {
                    case ARROW_UP: // ctrl-arrow-up => select element above
                        editor.selectParent();
                        stopEvent(event);
                        break;
                    case ARROW_DOWN: // ctrl-arrow-down => select element beneath
                        editor.selectFirstLeafChildBox();
                        stopEvent(event);
                        break;
                    case 'z': // ctrl-z => UNDO
                        if (!shouldBeHandledByBrowser.value) {
                            LOGGER.log('Ctrl-z: UNDO');
                            const delta = AstActionExecutor.getInstance(editor).undo();
                            LOGGER.log(`FreonComponent undu '${delta?.toString()} || ${editor.isBoxInTree(editor.selectedBox)}'`)
                            if (delta !== undefined && !editor.isBoxInTree(editor.selectedBox)) {
                                FreEditorUtil.selectAfterUndo(editor, delta)
                            }
                            editor.selectionChanged()
                            stopEvent(event);
                            
                        }
                        break;
                    case 'y': // ctrl-y => REDO
                        if (!shouldBeHandledByBrowser.value) {
                            LOGGER.log('Ctrl-y: REDO');
                            const delta = AstActionExecutor.getInstance(editor).redo();
                            LOGGER.log(`FreonComponent undo '${delta?.toString()} || ${editor.isBoxInTree(editor.selectedBox)}'`)
                            if (delta !== undefined && !editor.isBoxInTree(editor.selectedBox)) {
                                FreEditorUtil.selectAfterUndo(editor, delta)
                            }
                            editor.selectionChanged()
                            stopEvent(event);
                        }
                        break;
                    case 'x': // ctrl-x => CUT
                        if (!shouldBeHandledByBrowser.value) {
                            LOGGER.log('Ctrl-x: CUT');
                            AstActionExecutor.getInstance(editor).cut();
                            stopEvent(event);
                        }
                        break;
                    case 'c': // ctrl-c => COPY
                        if (!shouldBeHandledByBrowser.value) {
                            LOGGER.log('Ctrl-c: COPY');
                            AstActionExecutor.getInstance(editor).copy();
                            stopEvent(event);
                        }
                        break;
                    case 'v': // ctrl-v => PASTE
                        if (!shouldBeHandledByBrowser.value) {
                            LOGGER.log('Ctrl-v: PASTE');
                            AstActionExecutor.getInstance(editor).paste();
                            stopEvent(event);
                        } else {
                            LOGGER.log('Ctrl-v: Handled by browser');
                            // stopEvent(event);
                        }
                        break;
                    case 'h': // ctrl-h => SEARCH
                        // todo
                        stopEvent(event);
                        break;
                    case 'a': // ctrl-a => SELECT ALL in focused control
                        // todo
                        // stopEvent(event);
                        break;
                }
            } else {
                switch (event.key) {
                    case 'z': // ctrl-alt-z => REDO
                        if (!shouldBeHandledByBrowser.value) {
                            AstActionExecutor.getInstance(editor).redo();
                            stopEvent(event);
                        }
                        break;
                }
            }
        } else if (event.altKey) {
            // NO ctrl
            if (event.shiftKey) {
                switch (event.key) {
                    case BACKSPACE: // alt-shift-backspace => REDO
                        if (!shouldBeHandledByBrowser.value) {
                            AstActionExecutor.getInstance(editor).redo();
                            stopEvent(event);
                        }
                        break;
                }
            } else {
                // NO shift
                switch (event.key) {
                    case BACKSPACE: // alt-backspace => UNDO
                        if (!shouldBeHandledByBrowser.value) {
                            AstActionExecutor.getInstance(editor).undo();
                            stopEvent(event);
                        }
                        break;
                    case ARROW_UP: // alt-arrow-up
                        editor.selectParent();
                        stopEvent(event);
                        break;
                    case ARROW_DOWN: // alt-arrow-down
                        editor.selectFirstLeafChildBox();
                        stopEvent(event);
                        break;
                }
            }
        } else if (event.shiftKey) {
            // NO ctrl, NO alt
            switch (event.key) {
                case TAB: // shift-tab
                    // editor.selectPreviousLeaf();
                    // stopEvent(event);
                    break;
            }
        } else {
            // No meta key pressed
            switch (event.key) {
                case ARROW_LEFT:
                    editor.selectPreviousLeafIncludingExpressionPreOrPost();
                    stopEvent(event);
                    break;
                case DELETE:
                case BACKSPACE:
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case TAB:
                case ENTER:
                    // editor.selectNextLeaf();
                    // stopEvent(event);
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
        contextMenuVisible.value = false;
        // we use a timeOut here, to improve performance
        if (notNullOrUndefined(freonRootElement)) {
            setTimeout(() => {
                editor.scrollX = freonRootElement!.scrollLeft;
                editor.scrollY = freonRootElement!.scrollTop;
            }, 400);
        }
        // Might use another value for the delay, but this seems ok.
    }

    /**
     * Returns the nearest scrollable ancestor for this component's root.
     */
    export function getScrollContainer(): HTMLElement | null {
        return getNearestScrollContainer(freonRootElement);
    }

    /**
     * Returns a promise that resolves to the visible rectangle of `el`
     * (intersection with viewport and clipping ancestors), in the same
     * coordinate system as getBoundingClientRect(),
     * or `null` if no element was provided.
     */
    export function getVisibleRect(el: HTMLElement | undefined): Promise<DOMRectReadOnly | null> {
        const sc = getScrollContainer();
        if (isNullOrUndefined(el) || isNullOrUndefined(sc)) return Promise.resolve(null);

        return new Promise((resolve) => {
            LOGGER.log('getVisibleRect: returning promise')
            const io = new IntersectionObserver(
              (entries) => {
                  resolve(entries[0]?.intersectionRect ?? null);
                  io.disconnect();
              },
              { root: sc, threshold: [0] }
            );
            io.observe(el);
        });
    }

    const clientRectangle = (): ClientRectangle => {
        LOGGER.log(`FreonComponent clientRect`)
        return freonRootElement?.getBoundingClientRect() || UndefinedRectangle
    }

    const visibleRectangle = async (): Promise<DOMRectReadOnly | null> => {
        LOGGER.log(`FreonComponent visibleRect`)
        const rect = await getVisibleRect(freonRootElement);
        if (rect) {
            LOGGER.log("visible size:", rect.width, rect.height);
            return rect;
        } else {
            LOGGER.log("freonRootElement was null, skipping");
            return null;
        }
    }

    $effect(() => {
        editor.refreshComponentSelection = refreshSelection;
        editor.refreshComponentRootBox = refreshRootBox;
        editor.getClientRectangle = clientRectangle;
    });

    const refreshSelection = async (why?: string) => {
        LOGGER.log(
            'FreonComponent.refreshSelection: ' +
                why +
                ' editor selectedBox is ' +
                editor?.selectedBox?.kind
        );
        if (notNullOrUndefined(editor.selectedBox)) {
            //&& !$selectedBoxes.includes(editor.selectedBox)) { // selection is no longer in sync with editor
            await tick();
            selectedBoxes.value = getSelectableChildren(editor.selectedBox);
            editor.selectedBox.setFocus();
        }
    };

    function getSelectableChildren(box: Box): Box[] {
        const result: Box[] = [];
        // Because neither a TableRowBox nor an ElementBox has its own HTML equivalent,
        // its children are regarded to be selected.
        if (isTableRowBox(box)) {
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
        LOGGER.log(
            'REFRESH ' +
                why +
                ' ==================> FreonComponent with rootbox ' +
                rootBox?.id +
                ' unit ' +
                (notNullOrUndefined(rootBox?.node)
                    ? rootBox.node['name' as keyof FreNode]
                    : 'undefined')
        );
    };

    refreshRootBox('Initialize FreonComponent');
    refreshSelection('Initialize FreonComponent');

    // Make sure the right functions are available for the Dropdown component to be able to scroll if needed.
    const paneApi: PaneLike = { getVisibleRect, getScrollContainer };
    providePaneContext(paneApi);
</script>

<!-- TODO This makes us dependent on @material/... do we want that?-->
<!-- include the material design styling -->
<svelte:head>
    <link
        href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css"
        rel="stylesheet"
    />
    <script
        src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"
    ></script>
</svelte:head>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    class={'freon-component'}
    onkeydown={onKeyDown}
    onscroll={onScroll}
    bind:this={freonRootElement}
    {id}
    role="group"
>
    <div class="gutter"></div>
    <div class="editor-component">
        <RenderComponent {editor} box={rootBox} />
    </div>
</div>
<!-- Here the only instance of ContextMenu is defined -->
<!-- TODO make some default items for the context menu -->
<ContextMenu bind:this={contextMenu.instance} {editor} />
