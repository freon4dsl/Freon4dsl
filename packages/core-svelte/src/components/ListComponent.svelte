<script lang="ts">
    import { autorun } from "mobx";
    import { afterUpdate, onDestroy } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { Box, HorizontalListBox, PiEditor, PiLogger } from "@projectit/core";
    import { isHorizontalBox } from "@projectit/core";

    // Parameters
    export let list = new HorizontalListBox(null, "l1");
    export let editor: PiEditor;

    let LOGGER: PiLogger = new PiLogger("ListComponent").mute()
    let svList: HorizontalListBox =list;
    let svNotifier = new ChangeNotifier();

    onDestroy(() => {
        LOGGER.log("DESTROY LIST  COMPONENT")
    });

    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate for " + list.role);
        // NOTE: Triggers autorun whenever an element is added or delete from the list
        svNotifier.notifyChange();
    });
    // Local Variables
    let gridStyle;
    let cssGrgVars: string;
    autorun(() => {
        let boxes: ReadonlyArray<Box> = [];
        AUTO_LOGGER.log("AUTO LIST COMPONENT["+ svNotifier.dummy + "] " + list.role + " children " + list.children.length)
        svList = list;
        // @ts-ignore
        list.children.forEach(b => {
            LOGGER.log("    list element is " + b.role)
        });
        boxes = svList.children;
        gridStyle =
            isHorizontalBox(svList)
                ? {
                    gridTemplateColumns: "repeat(" + boxes.length + ", auto)",
                }
                : {
                    gridTemplateRows: "repeat(" + boxes.length + ", auto)",
                    gridTemplateColumns: "repeat(1, auto)",
                    color: "red",
                    backgroundColor: "green"
                };
        cssGrgVars = `--pi-list-grid-template-rows:   ${gridStyle.gridTemplateRows};
                      --pi-list-grid-template-columns:${gridStyle.gridTemplateColumns};
                      --color:                   ${gridStyle.color};
                                         `
    });

    // TODO Empty vertical list gives empty line, try to add entities in the example.
</script>

<span class="list-component" style="{cssGrgVars}" on:click tabIndex={0}>
    {#if isHorizontalBox(svList) }
        <div class="horizontalList"  on:click>
            {#each svList.children as box (box.id)}
                <RenderComponent box={box} editor={editor}/>
            {/each}
        </div>
    {:else}
        <div class="verticalList"  on:click>
            {#each svList.children as box (box.id)}
                <RenderComponent box={box} editor={editor}/>
            {/each}
        </div>
    {/if}
</span>

<style>
    .list-component {
        --pi-list-grid-template-columns: "";
        --pi-list-grid-template-rows: "";
        --pi-list-background-color: lightgray;
    }
    .horizontalList {
        grid-template-rows: var(--pi-list-grid-template-rows);
        grid-template-columns: var(--pi-list-grid-template-columns);
        white-space: nowrap;
        display: inline-block;
        background-color: var(--pi-list-background-color);
    }

    .verticalList {
        grid-template-rows: var(--pi-list-grid-template-rows);
        grid-template-columns: var(--pi-list-grid-template-columns);
        display: grid;
        background-color: var(--pi-list-background-color);
    }
</style>


