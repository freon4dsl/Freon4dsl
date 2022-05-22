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
                                <Item activated={(unit.name === $currentUnitName)}
                                      on:SMUI:action={() => menus[index].setOpen(true)}>
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
    import List, { Group, Item, Text, Separator } from "@smui/list";
    import { unitTypes } from "../stores/LanguageStore";
    import { currentUnitName, toBeDeleted, units } from "../stores/ModelStore";
    import type { MenuComponentDev } from "@smui/menu";
    import { Subtitle } from "@smui/drawer";
    import Menu from "@smui/menu";
    import { deleteUnitDialogVisible } from "../stores/DialogStore";
    import { EditorCommunication } from "../../language/EditorCommunication";
    import { setUserMessage } from "../stores/UserMessageStore";
    import { modelErrors } from "../stores/InfoPanelStore";
    import { ImportExportHandler } from "../../language/ImportExportHandler";

    let activated: boolean = true;
    let menus: MenuComponentDev[] = [];

    let myUnits = [];
    $: myUnits = !!$units && $units.length > 0
        ? $units.sort((u1, u2) => {
            if (u1.name > u2.name) {
                return 1;
            }
            if (u1.name < u2.name) {
                return -1;
            }
            return 0;
        })
        : [];

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
    };

    const exportUnit = (index: number) => {
        new ImportExportHandler().exportUnit($units[index]);
    };
</script>

<style>
    * :global(.demo-list) {
        max-width: 600px;
        /* todo use color variable here */
        border-left: 1px solid darkred;
    }
</style>
