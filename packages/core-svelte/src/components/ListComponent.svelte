<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import {
        Box,
        HorizontalListBox,
        isEmptyLineBox,
        ListBox,
        PiEditor,
        PiLogger,
        isHorizontalBox
    } from "@projectit/core";

    // Parameters
    export let box: ListBox ; //= new HorizontalListBox(null, "l1");
    export let editor: PiEditor;

    // Local state variables
    let LOGGER: PiLogger = new PiLogger("ListComponent");
    let svList: ListBox = box; // TODO question: why a new variable, cannot use 'box'?
    let element: HTMLSpanElement;
    let children: Box[];
    $: children = [...box.children];

    async function setFocus(): Promise<void> {
        FOCUS_LOGGER.log("ListComponent.setFocus for box " + box.role);
        if (!!element) {
            element.focus();
        }
    }

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH ListComponent " + box?.element?.piLanguageConcept() + "-" + box?.element?.piId() + ", " + box.role);
        svList = box;
        children = [...box.children];
    }

    onMount( () => {
        MOUNT_LOGGER.log("ListComponent onMount --------------------------------")
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate for " + box.role);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // TODO Empty vertical box gives empty line, try to add entities in the example.
    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onFocus for box " + box.role);
        // e.preventDefault();
        // e.stopPropagation();
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onBlur for box " + box.role);
        // e.preventDefault();
        // e.stopPropagation();
    }

    // function box(box: Box): Box {
    //     LOGGER.log("render box " + box.role);
    //     return box;
    // }

    function setPrevious(b: Box): string {
        previousBox = b;
        return "";
    }

    let previousBox = null;

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }

</script>

<span class="list-component"
      on:click
      on:focus={onFocusHandler}
      on:blur={onBlurHandler}
      tabIndex={0}
      bind:this={element}
>
    {#if isHorizontalBox(svList) }
        <div class="horizontalList"  on:click>
            {#each children as box (box.id)}
                <RenderComponent box={box} editor={editor}/>
            {/each}
        </div>
    {:else}
        <div class="verticalList"  on:click>
            {#each children as box, i (box.id)}
                {#if i > 0 && i < children.length
                     && !(i === 1 && isEmptyLineBox(previousBox))
                }
                    <br/>
                {/if}
                <RenderComponent box={box} editor={editor}/>
                { setPrevious(box) }
            {/each}
        </div>
    {/if}
</span>

<style>
    .list-component {
        --pi-list-grid-template-columns: "";
        --pi-list-grid-template-rows: "";
    }
    .horizontalList {
        /*grid-template-rows: var(--pi-list-grid-template-rows);*/
        /*grid-template-columns: var(--pi-list-grid-template-columns);*/
        white-space: nowrap;
        display: inline-block;
        padding: var(--freon-horizontallist-component-padding, 1px);
        background-color: var(--freon-editor-component-background-color, white);
        border-color: var(--freon-horizontallist-component-border-color, darkgreen);
        border-width: var(--freon-horizontallist-component-border-width, 1pt);
        border-style: var(--freon-horizontallist-component-border-style, solid);
        margin: var(--freon-horizontallist-component-margin, 1px);
        box-sizing: border-box;
    }

    .verticalList {
        /*grid-template-rows: var(--pi-list-grid-template-rows);*/
        /*grid-template-columns: var(--pi-list-grid-template-columns);*/
        /*display: grid;*/
        background-color: var(--freon-editor-component-background-color, white);
        padding: var(--freon-verticallist-component-padding, 1px);
        margin: var(--freon-verticallist-component-margin, 1px);
        border-color: var(--freon-verticallist-component-border-color, darkgreen);
        border-width: var(--freon-verticallist-component-border-width, 1pt);
        border-style: var(--freon-verticallist-component-border-style, solid);

        /*margin-top: 10px;*/
        box-sizing: border-box;
    }
</style>


