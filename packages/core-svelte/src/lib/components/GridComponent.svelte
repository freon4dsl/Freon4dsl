<script lang="ts">
    import { GRID_LOGGER } from './ComponentLoggers.js';
    import { type GridCellBox, type GridBox, notNullOrUndefined } from '@freon4dsl/core';
    import GridCellComponent from './GridCellComponent.svelte';
    import { componentId, type FreComponentProps } from '../index.js';

    const LOGGER = GRID_LOGGER;

    let { editor, box }: FreComponentProps<GridBox> = $props();

    let id: string = $state('');
    let cells: GridCellBox[] = $state([]);
    let templateColumns: string = $state('');
    let templateRows: string = $state('');
    let cssClass: string = $state('');
    let htmlElement: HTMLElement;

    const refresh = (why?: string): void => {
        LOGGER.log('refresh ' + why);
        if (notNullOrUndefined(box)) {
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
