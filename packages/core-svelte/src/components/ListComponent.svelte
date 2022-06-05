<script lang="ts">
    import { autorun } from "mobx";
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { Box, conceptStyle, HorizontalListBox, ListBox, PiEditor, PiLogger, styleToCSS } from "@projectit/core";
    import { isHorizontalBox } from "@projectit/core";

    // Parameters
    export let list: ListBox ; //= new HorizontalListBox(null, "l1");
    export let editor: PiEditor;

    // console.log("LIST COMPONET READ " + list?.role)
    // Local state variables
    let LOGGER: PiLogger = new PiLogger("ListComponent");
    let svList: HorizontalListBox = list;
    let svNotifier = new ChangeNotifier();
    let element: HTMLDivElement;
    let children: Box[];
    $: children = [...list.children];

    onDestroy(() => {
        LOGGER.log("DESTROY LIST  COMPONENT")
    });

    async function setFocus(): Promise<void> {
        FOCUS_LOGGER.log("ListComponent.setFocus for box " + list.role);
        if (!!element) {
            element.focus();
        }
    }
    onMount( () => {
        MOUNT_LOGGER.log("ListComponent onMount --------------------------------")
        list.setFocus = setFocus;
    });

    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate for " + list.role);
        list.setFocus = setFocus;
        // NOTE: Triggers autorun whenever an element is added or delete from the list
        svNotifier.notifyChange();
    });
    // Local Variables
    let gridStyle;
    let cssGrgVars: string;
    autorun(() => {
        LOGGER.log("AUtorun list")
        svNotifier.dummy
        svList = list;
        children = [...list.children];
        list.setFocus = setFocus;

        const nrOfBoxes = svList.children.length;
        gridStyle =
            isHorizontalBox(svList)
                ? {
                    gridTemplateColumns: "repeat(" + nrOfBoxes + ", auto)",
                }
                : {
                    gridTemplateRows: "repeat(" + nrOfBoxes + ", auto)",
                    gridTemplateColumns: "repeat(1, auto)",
                    backgroundColor: "green"
                };
        cssGrgVars = `--pi-list-grid-template-rows:   ${gridStyle.gridTemplateRows};
                      --pi-list-grid-template-columns:${gridStyle.gridTemplateColumns};
                     `
        // useless, list has no contents!
        + styleToCSS(conceptStyle(editor.style, editor.theme, list.element.piLanguageConcept(), "list", list.style));
    });

    // TODO Empty vertical list gives empty line, try to add entities in the example.
    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onFocus for box " + list.role);
        // e.preventDefault();
        // e.stopPropagation();
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onBlur for box " + list.role);
        // e.preventDefault();
        // e.stopPropagation();
    }

    function box(box: Box): Box {
        LOGGER.log("render box " + box.role);
        return box;
    }
</script>

<span class="list-component"
      style="{cssGrgVars}"
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
                {#if i > 0 && i < children.length}
                    <br/>
                {/if}
                <RenderComponent box={box} editor={editor}/>
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
        margin: var(--freon-horizontallist-component-margin, 1px);
    }

    .verticalList {
        /*grid-template-rows: var(--pi-list-grid-template-rows);*/
        /*grid-template-columns: var(--pi-list-grid-template-columns);*/
        /*display: grid;*/
        background-color: var(--freon-editor-component-background-color, white);
        padding: var(--freon-verticallist-component-padding, 1px);
        margin: var(--freon-verticallist-component-margin, 1px);
        /*margin-top: 10px;*/
    }
</style>


