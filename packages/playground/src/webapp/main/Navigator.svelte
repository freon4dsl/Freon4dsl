<div class="navigator">
    <div class="nav-title">Model {$currentModelName}</div>
    <hr>
    <ul class="list">
        {#each $unitTypes as name}
            <li class="type-name">Unit Type <i>{name}</i>
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
    import {
        unitTypes,
        units,
        currentModelName,
        toBeDeleted,
        deleteUnitDialogVisible,
        currentUnitName
    } from "../WebappStore";
    import { Menu, Menuitem } from "svelte-mui";
    import type { PiNamedElement } from "@projectit/core";
    import { EditorCommunication } from "../editor/EditorCommunication";

    const openUnit = (unit: PiNamedElement) => {
        EditorCommunication.getInstance().openModelUnit(unit);
    };

    const deleteUnit = (unit: PiNamedElement) => {
        console.log("delete unit called: " + unit.name);
        $toBeDeleted = unit;
        $deleteUnitDialogVisible = true;
    };

    const exportUnit = (unit: PiNamedElement) => {
        console.log("export unit called:" + unit.name);
        // create a text string from the unit
        let text: string = EditorCommunication.getInstance().unitAsText();
        // get the default file name from the current unit and its unit meta type
        const fileExtension: string = EditorCommunication.getInstance().unitFileExtension();
        let defaultFileName: string = unit.name + fileExtension;

        // create a HTML element that contains the text string
        let textFile = null;
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            URL.revokeObjectURL(textFile);
        }
        textFile = URL.createObjectURL(data);

        // create a link for the download
        var link = document.createElement('a');
        link.setAttribute('download', defaultFileName);
        link.href = textFile;
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
            var event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    }
</script>

<style>
    .navigator {
        color: var(--theme-colors-color);
        font-size: var(--pi-error-font-size);
        padding: 6px;
    }
    .nav-title {
        font-weight: bold;
    }
    .list {
        list-style-type: none;
        padding-left: 0px;
    }
    .bullet-list {
        list-style-type: square;
        padding-left: 6px;
    }
    .type-name {
        color: var(--theme-colors-accent);
    }
    .item-name {
        display: block;
        color: var(--theme-colors-color);
    }
</style>
