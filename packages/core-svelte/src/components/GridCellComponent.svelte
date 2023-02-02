<script lang="ts">
    import {
        GridBox,
        isMetaKey,
        ENTER,
        type FreEditor,
        FreLogger,
        toFreKey,
        GridCellBox,
        Box
    } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import RenderComponent from "./RenderComponent.svelte";
    import { componentId } from "./svelte-utils";
    import { executeCustomKeyboardShortCut, isOdd } from "./svelte-utils";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox;
    export let editor: FreEditor;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    //local variables
    const LOGGER = new FreLogger("GridCellComponent");
    let boxStore: Writable<Box> = writable<Box>(cellBox.content); // todo see if we can do without this store
    let cssVariables: string;
    let id: string = !!cellBox? componentId(cellBox) : 'gridcell-for-unknown-box';

    let row: string;
    let column: string;
    let int: number = 0;
    let orientation: BoxTypeName = "gridcellNeutral";
    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";
    let htmlElement: HTMLElement;

    function refresh(from? : string): void {
        if (!!cellBox) {
            LOGGER.log("REFRESH GridCellComponent " + (!!from ? " from " + from + " " : "") + cellBox?.element?.freLanguageConcept() + "-" + cellBox?.element?.freId());
            $boxStore = cellBox.content;
            LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.content.role + "--- " + int++);
            row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
            column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
            orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
            if (cellBox.isHeader) {
                isHeader = "gridcell-header";
            }
            cssStyle = $boxStore.cssStyle;
            cssClass = cellBox.cssClass;
            $boxStore = cellBox.content;
        }
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    onMount( () => {
        cellBox.refreshComponent = refresh;
        cellBox.setFocus = setFocus;
    }) ;

    afterUpdate(() => {
        cellBox.refreshComponent = refresh;
        cellBox.setFocus = setFocus;
    });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        const freKey = toFreKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            // todo adjust the index, so that we know where to execute the command
            const index = 0;
            executeCustomKeyboardShortCut(event, index, cellBox, editor);
        }
    };

    const onCellClick = (() => {
        // todo remove this or implement...
        LOGGER.log("GridCellComponent.onCellClick " + cellBox.row + ", " + cellBox.column);
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(cellBox?.id);
    }
</script>

<div
        class="gridcellcomponent {orientation} {isHeader} {cssClass}"
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        onClick={onCellClick}
        on:keydown={onKeydown}
        id="{id}"
        tabIndex={0}
        bind:this={htmlElement}
>
    <RenderComponent box={$boxStore} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: border-box;
        align-self: stretch;
        justify-self: var(--freon-gridcell-component-justify-left, stretch);
        display: flex;
        padding: var(--freon-gridcell-component-padding, 1px);
        background-color: var(--freon-gridcell-component-background-color, white);
        color: var(--freon-gridcell-component-color, inherit);
    }
</style>
