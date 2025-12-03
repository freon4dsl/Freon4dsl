<div>
    <Group>
        {#each unitTypes.list as name}
            <Separator/>
            <Subtitle>{name}</Subtitle>
            <List class="demo-list" dense>
                {#if !!myUnits}
                    {#each myUnits as unit, index}
                        {#if unit.freLanguageConcept() === name}
                            <div
                                    class={Object.keys(anchorClasses).join(index + ' ')}
                                    use:Anchor={{addClass: addClass, removeClass: removeClass}}
                                    bind:this={anchor[index]}
                            >
                                <Item activated={(unit.name === currentUnit.ref?.name)}
                                      onSMUIAction={() => menus[index].setOpen(true)}>
                                    <Text>{unit.name}</Text>
                                </Item>
                                <Menu bind:this={menus[index]}
                                      anchor={false}
                                      bind:anchorElement={anchor[index]}
                                      anchorCorner="BOTTOM_LEFT"
                                >
                                    <List>
                                        <Item onSMUIAction={() => (openUnit(index))}>
                                            <Text>Open</Text>
                                        </Item>
                                        <Item onSMUIAction={() => (saveUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Save</Text>
                                        </Item>
                                        <Item onSMUIAction={() => (renameUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Rename</Text>
                                        </Item>
                                        <Item onSMUIAction={() => (deleteUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Delete</Text>
                                        </Item>
                                        <Separator/>
                                        <Item onSMUIAction={() => (exportUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
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
    import List, { Group, Item, Separator, Text } from "@smui/list";
    import { unitTypes } from "../stores/LanguageStore.svelte";
    import { currentUnit, toBeDeleted, toBeRenamed, units } from "../stores/ModelStore.svelte";
    import MenuComponentDev from "@smui/menu";
    import Menu from "@smui/menu";
    import { Subtitle } from "@smui/drawer";
    import { deleteUnitDialogVisible, renameUnitDialogVisible } from "../stores/DialogStore.svelte";
    import { EditorState } from "$lib/language/EditorState";
    import { setUserMessage } from "../stores/UserMessageStore.svelte";
    import { ImportExportHandler } from "$lib/language/ImportExportHandler";
    import { Anchor } from "@smui/menu-surface";
    import { FreErrorSeverity, type FreModelUnit } from "@freon4dsl/core";
    import {WebappConfigurator} from "$lib";
    
    // TODO add rename option to context menu
    let menus: MenuComponentDev[] = $state([]);
    // following is used to position the menu
    let anchor: HTMLDivElement[] = $state([]);
    let anchorClasses: { [k: string]: boolean } = $state({});

    const addClass = (className: string) => {
        if (!anchorClasses[className]) {
            anchorClasses[className] = true;
        }
    }
    const removeClass = (className: string) => {
        if (anchorClasses[className]) {
            delete anchorClasses[className];
            anchorClasses = anchorClasses;
        }
    }
    // end positioning

    let myUnits: FreModelUnit[] = $state([]);
    $effect(() => {
        myUnits = !!units.refs && units.refs.length > 0
            ? units.refs.sort((u1: FreModelUnit, u2: FreModelUnit) => {
                if (u1.name > u2.name) {
                    return 1;
                }
                if (u1.name < u2.name) {
                    return -1;
                }
                return 0;
            })
            : [];
    });

    const openUnit = (index: number) => {
        EditorState.getInstance().openModelUnit(units.refs[index]);
    };

    const deleteUnit = (index: number) => {
        // console.log("ModelInfo.deleteUnit: " + $units[index].name);
        toBeDeleted.ref = units.refs[index];
        deleteUnitDialogVisible.value = true;
    };

    const saveUnit = (index: number) => {
        // console.log("ModelInfo.saveUnit: " + units.refs[index].name);
        if (units.refs[index].name === currentUnit.id?.name) {
            EditorState.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${units.refs[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${units.refs[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
    };

    const renameUnit = (index: number) => {
        // console.log("ModelInfo.renameUnit: " + units.refs[index].name);
        toBeRenamed.ref = units.refs[index];
        renameUnitDialogVisible.value = true;
    };

    const exportUnit = (index: number) => {
        // TODO Only allow export of current unit, may be extended to other units.
        if (units.refs[index].name !== currentUnit.id?.name) {
            // TODO make error message more clear
            setUserMessage('Can only export unit in editor', FreErrorSeverity.Warning);
        } else {
            new ImportExportHandler().exportUnit(units.refs[index]);
        }
    };
</script>
