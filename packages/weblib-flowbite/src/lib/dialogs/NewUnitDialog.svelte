<script lang="ts">
    import { dialogs, editorInfo, setUserMessage, WebappConfigurator } from "$lib"
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { checkName } from "$lib/language/DialogHelpers"
    import { cancelButtonClass, okButtonClass, textInputClass } from "$lib/stores/StylesStore.svelte"
    import { notNullOrUndefined } from "@freon4dsl/core"
    import { Button, Helper, Input } from "flowbite-svelte"
    import { FolderOpenSolid } from "flowbite-svelte-icons"

    const initialHelperText: string = 'Enter the name of the new unit.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function resetVariables() {
        // dialogs.newUnitDialogVisible = false;
        newName = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newUnitDialogVisible = false;
        resetVariables();
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }
    async function handleSubmit() {
        if (newName.length > 0 && checkName(newName).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getUnitNames();
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
                helperText = `Cannot create unit '${newName}', because a unit with that name already exists on the server.`;
            } else {
                if (editorInfo.toBeCreated?.type) {
                    const name = newName
                    dialogs.newUnitDialogVisible = false;
                    resetVariables();
                    const result = await WebappConfigurator.getInstance().newUnit(name, editorInfo.toBeCreated?.type);
                } else {
                    setUserMessage('Cannot create a new unit, because its type is unknown.')
                }
            }
        } else {
            helperText = `Cannot create unit '${newName}', because its name is invalid.`;
        }
    }

    const onInput = () => {
        helperText = checkName(newName);
    }

    let  a = false
</script>

<Dialog open={dialogs.newUnitDialogVisible}>
    <h3 class="text-xl font-medium">New {editorInfo.toBeCreated?.type} unit</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-light-base-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="unit-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-light-base-900">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </div>
    </div>

    <div class="flex flex-row justify-end mt-0">
        <Button onclick={handleCancel} class={cancelButtonClass}>
            Cancel
        </Button>
        <Button class={okButtonClass} onclick={handleSubmit} >
            <FolderOpenSolid class="w-4 h-4 me-2"/>
            New
        </Button>
    </div>
</Dialog>

