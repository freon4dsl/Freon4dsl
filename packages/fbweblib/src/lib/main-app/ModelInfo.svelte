<script lang="ts">
    import {
        Dropdown,
        DropdownItem,
        Heading,
        Listgroup,
        ListgroupItem
    } from 'flowbite-svelte';
    import {ChevronDownOutline, DotsHorizontalOutline} from 'flowbite-svelte-icons';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {FreErrorSeverity, type FreModelUnit} from "@freon4dsl/core";
    import {setUserMessage} from "$lib/stores/UserMessageStore.svelte";
    import {editorInfo, modelInfo} from "$lib/stores/ModelInfo.svelte.js";

    let myUnits: FreModelUnit[] = $state([]);
    $effect(() => {
        myUnits = !!modelInfo.units && modelInfo.units.length > 0
            ? modelInfo.units.sort((u1: FreModelUnit, u2: FreModelUnit) => {
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
        // EditorState.getInstance().openModelUnit(modelInfo.units[index]);
    };

    const deleteUnit = (index: number) => {
        // console.log("ModelInfo.deleteUnit: " + $units[index].name);
        editorInfo.toBeDeleted = modelInfo.units[index];
        // deleteUnitDialogVisible.value = true;
    };

    const saveUnit = (index: number) => {
        // console.log("ModelInfo.saveUnit: " + modelInfo.units[index].name);
        if (modelInfo.units[index].name === editorInfo.currentUnit?.name) {
            // EditorState.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${modelInfo.units[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${modelInfo.units[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
    };

    const renameUnit = (index: number) => {
        // console.log("ModelInfo.renameUnit: " + modelInfo.units[index].name);
        editorInfo.toBeRenamed = modelInfo.units[index];
        // renameUnitDialogVisible.value = true;
    };

    const exportUnit = (index: number) => {
        if (modelInfo.units[index].name !== editorInfo.currentUnit?.name) {
            setUserMessage('Can only export unit currently shown in the editor', FreErrorSeverity.Warning);
        } else {
            // new ImportExportHandler().exportUnit(modelInfo.units[index]);
        }
    };

</script>

<Listgroup>
    {#each langInfo.unitTypes as unitType}
        <Heading tag="h5" class="pl-2">{unitType}</Heading>
        <ListgroupItem class="gap-2 text-base font-semibold">
            <Listgroup>
                {#each myUnits as unit, index}
                    {#if unit.freLanguageConcept() === unitType}
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
