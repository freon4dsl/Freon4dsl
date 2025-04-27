<script lang="ts">
    import { GRID_LOGGER } from '$lib/components/ComponentLoggers.js';
    import { GridCellBox, GridBox, isNullOrUndefined, FreEditor } from '@freon4dsl/core';
    import GridCellComponent from './GridCellComponent.svelte';
    import {componentId, type GridProps} from '$lib';

    const LOGGER = GRID_LOGGER;

    let { editor, box }: GridProps = $props();

    let id: string = $state('');
    let cells: GridCellBox[] = $state([]);
    let templateColumns: string = $state('');
    let templateRows: string = $state('');
    let cssClass: string = $state('');
    let htmlElement: HTMLElement;

    const refresh = (why?: string): void => {
        LOGGER.log('refresh ' + why);
        if (!isNullOrUndefined(box)) {
            // console.log("REFRESH GridComponent " + box?.element?.freLanguageConcept() + "-" + box?.element?.freId());
            id = componentId(box);
            cells = [...(box as GridBox).cells];
            // length = cells.length;
            templateRows = `repeat(${(box as GridBox).numberOfRows() - 1}, auto)`;
            templateColumns = `repeat(${(box as GridBox).numberOfColumns() - 1}, auto)`;
            cssClass = box.cssClass;
        } else {
            id = 'grid-for-unknown-box';
        }
    };

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    $effect(() => {
        // runs after the initial onMount
        LOGGER.log('GridComponent afterUpdate for girdBox ' + box.node.freLanguageConcept());
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    $effect(() => {
        // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    });
</script>

<div
    style:grid-template-columns={templateColumns}
    style:grid-template-rows={templateRows}
    class="grid-component {cssClass}"
    {id}
    tabIndex={0}
    bind:this={htmlElement}
>
    {#each cells as cell (cell?.content?.node?.freId() + '-' + cell?.content?.id + cell?.role + '-grid')}
        <GridCellComponent parentBox={box} box={cell} {editor} />
    {/each}
</div>
