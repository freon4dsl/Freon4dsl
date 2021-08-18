<div class="navigator">
    {$currentModelName}
    <ul class="list">
        {#each $unitTypes as name}
            <li class="type-name">unit type <i>{name}</i>
                <ul class="bullet-list">
                    {#each $units as unit}
                        <Menu origin="top left">
                            <div class="item-name" slot="activator">
                                <li>{unit.name}</li>
                            </div>

                            <Menuitem on:click={() => openUnit(unit)}>Open</Menuitem>
                            <Menuitem on:click={() => exportUnit(unit)}>Export</Menuitem>
                            <Menuitem on:click={() => deleteUnit(unit)}>Delete</Menuitem>

                        </Menu>
                        <br>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</div>

<script lang="ts">
    import { unitTypes, units, currentModelName, toBeDeleted, deleteUnitDialogVisible } from "../WebappStore";
    import { Menu, Menuitem } from "svelte-mui";
    import type PiNamedElement from "@projectit/core";
    import { EditorCommunication } from "../editor/EditorCommunication";

    // let unit;
    const openUnit = (unit: PiNamedElement) => {
        EditorCommunication.getInstance().openModelUnit(unit);
    };
    const deleteUnit = (unit: PiNamedElement) => {
        console.log("delete unit called: " + unit.name);
        // $toBeDeleted = unit;
        // $deleteUnitDialogVisible = true;
        EditorCommunication.getInstance().deleteModelUnit(unit);
    };
    const exportUnit = (unit: PiNamedElement) => {
        console.log("export unit called:" + unit.name);
    };
</script>

<style>
    .navigator {
        color: var(--theme-colors-color);
        font-size: var(--pi-error-font-size);
        padding: 6px;
    }
    .list {
        list-style-type: none;
        padding-left: 12px;
    }
    .bullet-list {
        list-style-type: square;
        padding-left: 18px;
    }
    .type-name {
        color: red;
    }
    .item-name {
        display: block;
    }
</style>
