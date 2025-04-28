<script lang="ts">
    import { GRIDCELL_LOGGER } from '$lib/components/ComponentLoggers.js';
    import { isMetaKey, ENTER, Box, isNullOrUndefined, type GridCellBox } from '@freon4dsl/core';
    import RenderComponent from './RenderComponent.svelte';
    import { componentId, dummyBox, executeCustomKeyboardShortCut, isOdd } from '$lib';
    import type { GridCellProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    // properties
    let { editor, box, parentBox }: GridCellProps<GridCellBox> = $props();

    type BoxTypeName = 'gridcellNeutral' | 'gridcellOdd' | 'gridcellEven';

    //local variables
    const LOGGER = GRIDCELL_LOGGER;
    let contentBox: Box = $state(dummyBox);
    let id: string = !isNullOrUndefined(box) ? componentId(box) : 'gridcell-for-unknown-box';

    let row: string = $state('');
    let column: string = $state('');
    let int: number = 0;
    let orientation: BoxTypeName = $state('gridcellNeutral');
    let isHeader = $state('noheader');
    let cssStyle: string = $state('');
    let cssClass: string = $state('');
    let htmlElement: HTMLElement;

    function refresh(from?: string): void {
        if (!isNullOrUndefined(box)) {
            LOGGER.log(
                'REFRESH GridCellComponent ' +
                    (!isNullOrUndefined(from) ? ' from ' + from + ' ' : '') +
                    box?.node?.freLanguageConcept() +
                    '-' +
                    box?.node?.freId()
            );
            LOGGER.log(
                'GridCellComponent row/col ' +
                    box.$id +
                    ': ' +
                    box.row +
                    ',' +
                    box.column +
                    '  span ' +
                    box.rowSpan +
                    ',' +
                    box.columnSpan +
                    '  box ' +
                    box.content.role +
                    '--- ' +
                    int++
            );
            contentBox = box.content;
            row = box.row + (box.rowSpan ? ' / span ' + box.rowSpan : '');
            column = box.column + (box.columnSpan ? ' / span ' + box.columnSpan : '');
            orientation =
                parentBox.orientation === 'neutral'
                    ? 'gridcellNeutral'
                    : parentBox.orientation === 'row'
                      ? isOdd(box.row)
                          ? 'gridcellOdd'
                          : 'gridcellEven'
                      : isOdd(box.column)
                        ? 'gridcellOdd'
                        : 'gridcellEven';
            if (box.isHeader) {
                isHeader = 'gridcell-header';
            }
            cssStyle = contentBox.cssStyle;
            cssClass = box.cssClass;
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

    $effect(() => {
        // runs after the initial onMount
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    const onKeydown = (event: KeyboardEvent) => {
        // todo this does not work anymore because the key down is handled by the box inside the table cell, remove it?
        LOGGER.log('GridCellComponent onKeyDown');
        // const freKey = toFreKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log('Keyboard shortcut in GridCell ===============');
            const index = box.propertyIndex;
            executeCustomKeyboardShortCut(event, index, box, editor);
        }
    };

    $effect(() => {
        // Evaluated and re-evaluated when the box changes.
        refresh(box?.id);
    });
</script>

<div
    class="grid-cell-component {orientation} {isHeader} {cssClass}"
    style:grid-row={row}
    style:grid-column={column}
    style={cssStyle}
    onkeydown={onKeydown}
    {id}
    bind:this={htmlElement}
    role="gridcell"
    tabindex={0}
>
    <RenderComponent box={contentBox} {editor} />
</div>
