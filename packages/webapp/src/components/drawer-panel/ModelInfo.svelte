<div>
    <Group>
        {#each $unitTypes as name}
            <Separator/>
            <Subtitle>{name}</Subtitle>
            <List class="demo-list" dense>
                {#if !!myUnits}
                    {#each myUnits as unit, index}
                        {#if unit.piLanguageConcept() === name}
                            <div>
                                <Item activated={(unit.name === $currentUnitName)} on:SMUI:action={() => menus[index].setOpen(true)}>
                                    <Text>{unit.name}</Text>
                                </Item>
                                <Menu bind:this={menus[index]}>
                                    <List>
                                        <Item on:SMUI:action={() => (openUnit(index))}>
                                            <Text>Open</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (saveUnit(index))}>
                                            <Text>Save</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (deleteUnit(index))}>
                                            <Text>Delete</Text>
                                        </Item>
                                        <Separator/>
                                        <Item on:SMUI:action={() => (exportUnit(index))}>
                                            <Text>Export</Text>
                                        </Item>
                                    </List>
                                </Menu>
                            </div>
                        {/if}
                    {/each}
                {:else}
                    <div>
                        <Item activated={false}>
                            <Text>no units available</Text>
                        </Item>
                    </div>
                {/if}
            </List>
        {/each}
        <Separator/>
    </Group>
</div>

<script lang="ts">
    import List, { Group, Item, Text, Separator } from '@smui/list';
    import { unitTypes } from "../stores/LanguageStore";
    import { currentUnitName, toBeDeleted, units } from "../stores/ModelStore";
    import type { MenuComponentDev } from '@smui/menu';
    import { Subtitle } from "@smui/drawer";
    import Menu from '@smui/menu';
    import { deleteUnitDialogVisible } from "../stores/DialogStore";
    import { EditorCommunication } from "../../language/EditorCommunication";
    import { setUserMessage } from "../stores/UserMessageStore";
    import { modelErrors } from "../stores/InfoPanelStore";

    let activated: boolean = true;
    let menus: MenuComponentDev[] = [];

    let myUnits = [];
    $: myUnits = $units;

    const openUnit = (index: number) => {
        EditorCommunication.getInstance().openModelUnit($units[index]);
    };

    const deleteUnit = (index: number) => {
        // console.log("ModelInfo.deleteUnit: " + $units[index].name);
        $toBeDeleted = $units[index];
        $deleteUnitDialogVisible = true;
    };

    const saveUnit = (index: number) => {
        console.log("ModelInfo.saveUnit: " + $units[index].name);
        if ($units[index].name === $currentUnitName) {
            EditorCommunication.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${$units[index].name}' saved.`, 0);
        } else {
            setUserMessage(`Unit '${$units[index].name}' has no changes.`, 0);
        }
    }

    const exportUnit = (index: number) => {
        // console.log("export unit called:" + unit.name);
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
        let defaultFileName: string = $units[index].name + fileExtension;

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
    * :global(.demo-list) {
        max-width: 600px;
        /* todo use color variable here */
        border-left: 1px solid darkred;
    }
</style>
