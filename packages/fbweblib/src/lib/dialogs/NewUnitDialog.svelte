<script lang="ts">
    import {Button, Modal, Label, Input, Radio, Helper, Select, type SelectOptionType} from 'flowbite-svelte';
    import * as Keys from "@freon4dsl/core"
    import {WebappConfigurator} from '$lib/language';
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {isKeyBoardEvent} from "$lib/ts-utils/CommonFunctions";
    import {editorInfo, langInfo} from "$lib";
    import type {ModelUnitIdentifier} from "@freon4dsl/core";

    const initialHelperText: string = "Enter or select a name.";
    let helperText: string = $state(initialHelperText);
    const invalidHelperText: string = "Name may contain only characters and numbers, and must start with a character.";
    let internalSelected: string = ""; // used for radio buttons
    let newName: string = $state('');
    let unitTypes: SelectOptionType<string>[] = $derived.by(() => {
        let result: SelectOptionType<string>[] = []
        langInfo.unitTypes.map(type => {
            result.push({
                value: type,
                name: type
            })
        })
        return result;
    });
    let selectedType: string = $state('');

    function newNameInvalid(): boolean {
        if (editorInfo.unitIds.map((u: ModelUnitIdentifier) => u.name).includes(newName)) {
            helperText = "Unit with this name already exists.";
            return true;
        } else if (newName === internalSelected) {
            return true; // one of the existing models is selected, this is ok => not invalid
        } else {
            if (!newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
                helperText = invalidHelperText;
                return false;
            } else {
                helperText = initialHelperText;
                return true;
            }
        }
    }

    function resetVariables() {
        dialogs.newUnitDialogVisible = false;
        newName = "";
        internalSelected = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newUnitDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        const comm = WebappConfigurator.getInstance();
        // console.log('Handle "submit": ' + newName)
        if (internalSelected?.length > 0) { // should be checked first
            await comm.openModelUnit(internalSelected);
            initializing.value = false;
        } else if (!newNameInvalid() && newName.length > 0) {
            // console.log("CREATING NEW UNIT: " + newName);
            if (selectedType && selectedType.length > 0 ) {
                await comm.newUnit(newName, selectedType);
                initializing.value = false;
            } else {
                setUserMessage(`Please select the type of the unit.`);
            }
        } else {
            setUserMessage(`Cannot create unit ${newName}, because its name is invalid.`);
        }
        resetVariables();
    }

    const handleEnterKey = (event: Event) => {
        console.log("handleEnterKey " + event)
        if (isKeyBoardEvent(event)) {
            switch (event.key) {
                case Keys.ENTER: { // on Enter key try to submit
                    event.stopPropagation();
                    event.preventDefault();
                    if (!newNameInvalid()) {
                        handleSubmit();
                        resetVariables();
                    }
                    break;
                }
            }
        }
    }

    const onInput = () => {
        newNameInvalid(); // sets the helperText
        internalSelected = '';
    }
</script>

<Modal bind:open={dialogs.newUnitDialogVisible} autoclose outsideclose class="w-full">

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="flex flex-col space-y-6" onkeydown={handleEnterKey} role="dialog">
        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Open or create a model unit</h3>
        <Label class="space-y-2">
            <Label>
                Select the type of the model unit
                <Select class="mt-2" items={unitTypes} bind:value={selectedType}/>
            </Label>
            <span>Name of unit</span>
            <Input bind:value={newName}
                   type="text"
                   name="model-name"
                   placeholder="my_model"
                   required
                   oninput={onInput}
            />
            <Helper class="mt-2 text-primary-900">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </Label>
        <div class="grid grid-cols-3">
            {#each editorInfo.unitIds as unit}
                {#if selectedType.length > 0}
                    {#if unit.type === selectedType}
                        <Radio class="p-2" name="units"
                               onchange={() => {internalSelected = unit.name}}>{unit.name}</Radio>
                    {/if}
                {:else}
                    <Radio class="p-2" name="units" onchange={() => {internalSelected = unit.name}}>{unit.name}</Radio>
                {/if}
            {/each}
        </div>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Open</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
