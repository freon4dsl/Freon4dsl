<script lang="ts">
    import {
        Dropdown,
        DropdownItem,
        Heading,
        Listgroup,
        ListgroupItem
    } from 'flowbite-svelte';
    import {DotsHorizontalOutline} from 'flowbite-svelte-icons';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {FreErrorSeverity, type ModelUnitIdentifier} from "@freon4dsl/core";
    import {setUserMessage} from "$lib/stores/UserMessageStore.svelte";
    import {editorInfo, type UnitInfo} from "$lib/stores/ModelInfo.svelte";

    let myUnits: UnitInfo[] = $state([]);
    $effect(() => {
        myUnits = !!editorInfo.unitIds && editorInfo.unitIds.length > 0
            ? editorInfo.unitIds.sort((u1: ModelUnitIdentifier, u2: ModelUnitIdentifier) => {
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
        console.log('openUnit ' + index)
        // EditorState.getInstance().openModelUnit(editorInfo.unitIds[index]);
    };

    const deleteUnit = (index: number) => {
        // console.log("editorInfo.deleteUnit: " + $units[index].name);
        editorInfo.toBeDeleted = editorInfo.unitIds[index];
        // deleteUnitDialogVisible.value = true;
    };

    const saveUnit = (index: number) => {
        // console.log("editorInfo.saveUnit: " + editorInfo.unitIds[index].name);
        if (editorInfo.unitIds[index].name === editorInfo.currentUnit?.name) {
            // EditorState.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${editorInfo.unitIds[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
    };

    const renameUnit = (index: number) => {
        // console.log("editorInfo.renameUnit: " + editorInfo.unitIds[index].name);
        editorInfo.toBeRenamed = editorInfo.unitIds[index];
        // renameUnitDialogVisible.value = true;
    };

    const exportUnit = (index: number) => {
        if (editorInfo.unitIds[index].name !== editorInfo.currentUnit?.name) {
            setUserMessage('Can only export unit currently shown in the editor', FreErrorSeverity.Warning);
        } else {
            // new ImportExportHandler().exportUnit(editorInfo.unitIds[index]);
        }
    };

</script>

<Listgroup>
    {#each langInfo.unitTypes as unitType}
        <Heading tag="h5" class="pl-2">{unitType}</Heading>
        <ListgroupItem class="gap-2 text-base font-semibold">
            <Listgroup>
                {#each myUnits as unit, index}
                    {#if unit.type === unitType}
                        <div class="flex justify-between">
                            {unit.name}
                            <!-- Instead of DotsHorizontalOutline we could use ChevronDownOutline-->
                            <DotsHorizontalOutline class="dots-menu1 inline dark:text-white"/>
                        </div>
                        <Dropdown triggeredBy=".dots-menu1">
                            <DropdownItem onclick={() => (openUnit(index))}>Open</DropdownItem>
                            <DropdownItem onclick={() => (saveUnit(index))}>Save</DropdownItem>
                            <DropdownItem onclick={() => (renameUnit(index))}>Rename</DropdownItem>
                            <DropdownItem onclick={() => (deleteUnit(index))}>Delete</DropdownItem>
                            <DropdownItem slot="footer" onclick={() => (exportUnit(index))}>Export</DropdownItem>
                        </Dropdown>
                    {/if}
                {/each}
            </Listgroup>
        </ListgroupItem>
    {/each}
</Listgroup>
