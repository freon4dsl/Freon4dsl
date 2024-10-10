<script lang="ts">
    import { GRID_LOGGER } from "$lib/components/ComponentLoggers.js";
    import { GridCellBox, type GridBox, type FreEditor, FreLogger } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { componentId } from "./svelte-utils/index.js";

    const LOGGER = GRID_LOGGER

    export let box: GridBox;
    export let editor: FreEditor;

    let id ;
    let cells: GridCellBox[];
    let templateColumns: string;
    let templateRows: string;
    let cssClass: string = "";
    let htmlElement: HTMLElement;

    const refresh = (why?: string): void =>  {
        LOGGER.log("refresh " + why);
        if (!!box) {
            // console.log("REFRESH GridComponent " + box?.element?.freLanguageConcept() + "-" + box?.element?.freId());
            id = componentId(box);
            cells = [...box.cells];
            length = cells.length;
            templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
            templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
            cssClass = box.cssClass;
        } else {
            id = 'grid-for-unknown-box';
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
        LOGGER.log("GridComponent onmount")
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    afterUpdate(() => {
        LOGGER.log("GridComponent afterUpdate for girdBox " + box.node.freLanguageConcept())
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    let dummy = 0;

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="grid-component {cssClass}"
        id="{id}"
        tabIndex={0}
        bind:this={htmlElement}
>
    {#each cells as cell (cell?.content?.node?.freId() + "-" + cell?.content?.id + cell?.role + "-grid")}
        <GridCellComponent grid={box} cellBox={cell} editor={editor}/>
    {/each}
</div>

