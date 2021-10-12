<div class="navigator">
    <div class="nav-title">{$currentModelName}</div>
    <hr>
    <ul class="list">
        {#each $unitTypes as name, index}
            <li class="type-name">Unit Type <i>{name}</i>
                <ul class="bullet-list">
                    {#each myUnits[index] as unit}
                        <Menu style="border-radius: 2px; margin: 0px; color: var(--theme-colors-color); background-color: var(--theme-colors-inverse_color)" origin="top left" dy="50px">
                            <div class="item-name" slot="activator">
                                <li>{unit.name}</li>
                            </div>

                            <Menuitem style="font-size: var(--pi-menuitem-font-size);
                                    margin: 4px 10px;
                                    padding: 2px;
                                    height: 18px;"
                                      on:click={() => openUnit(unit)}>Open</Menuitem>
                            <Menuitem style="font-size: var(--pi-menuitem-font-size);
                                    margin: 4px 10px;
                                    padding: 2px;
                                    height: 18px;"
                                      on:click={() => exportUnit(unit)}>Export</Menuitem>
                            <Menuitem style="font-size: var(--pi-menuitem-font-size);
                                    margin: 4px 10px;
                                    padding: 2px;
                                    height: 18px;"
                                      on:click={() => deleteUnit(unit)}>Delete</Menuitem>

                        </Menu>
                        <br>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</div>

<script lang="ts">
    import type { PiNamedElement } from "@projectit/core";
    import { Menu, Menuitem } from "svelte-mui";
    import {
        currentModelName,
        deleteUnitDialogVisible,
        toBeDeleted,
        units,
        unitTypes
    } from "../webapp-ts-utils/WebappStore";
    import { modelErrors } from "../webapp-ts-utils/ModelErrorsStore";
    import { setUserMessage } from "../webapp-ts-utils/UserMessageUtils";
    import { EditorCommunication } from "../editor/EditorCommunication";

    // initialize myUnits to something that will not break the app
    let myUnits: Array<PiNamedElement[]> = [];
    myUnits[0] = [];
    // set myUnits when model units are found
    $: if ($units) {
        // there are units, so fill the local data structure
        $units.forEach((xx: PiNamedElement[], index) => {
            // apparantly an empty array is represented as null
            // therefore this test to see if there is not a null value somewhere
            let empty: boolean = true;
            for (const x of xx) {
                if (x !== null) {
                    empty = false;
                }
            }
            if (empty) {
                myUnits[index] = [];
            } else {
                myUnits[index] = xx;
            }
        });
    } else {
        // no units, so set the local data structure to empty
        $unitTypes.forEach((name, index) => {
            myUnits[index] = [];
        })
    }

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
        // do not try to export a unit with errors
        // parsing and unparsing will not proceed correctly
        if ($modelErrors.length > 0) {
            setUserMessage(`Cannot export a unit that has errors`);
            return;
        }
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
        padding-left: 16px;
    }
    .type-name {
        color: var(--theme-colors-accent);
    }
    .item-name {
        display: block;
        color: var(--theme-colors-color);
    }
</style>
