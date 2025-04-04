<script lang="ts">
    import {Label, Modal} from 'flowbite-svelte';
    import {dialogs, langInfo} from "$lib";
    import {ArrowDownToBracketOutline} from "flowbite-svelte-icons";
    import {isNullOrUndefined} from "@freon4dsl/core";
    import {ImportExportHandler} from "$lib/language";

    let file_extensions: string = $derived.by(() => {
        return langInfo.fileExtensions.map(ext => `.${ext}`).join(", ")
    });
    let file_selector: HTMLElement | undefined = $state();
    let files: File[] = $state([]);

    const dropHandle = (event: DragEvent) => {
        files = [];
        event.preventDefault();
        if (event.dataTransfer?.items) {
            [...event.dataTransfer.items].forEach((item) => {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                        // console.log(`Adding2 ${file.name}`)
                    }
                }
            });
        } else {
            if (event.dataTransfer?.files) {
                [...event.dataTransfer.files].forEach((file) => {
                    // console.log(`Adding1 ${file}`)
                    files.push(file);
                });
            }
        }
        if (!isNullOrUndefined(files)) {
            new ImportExportHandler().importUnits(files);
            dialogs.importDialogVisible = false;
        }
    };

    const process_files = (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        const input = event.target as HTMLInputElement
        const fileList: FileList | null = input.files;
        if (!isNullOrUndefined(fileList)) {
            new ImportExportHandler().importUnits(fileList);
            dialogs.importDialogVisible = false;
        }
    }

    function onClick(event: MouseEvent) {
        event.preventDefault();
        file_selector?.click();
    }
</script>

<Modal bind:open={dialogs.importDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Import model unit(s)</h3>
        <button class="flex flex-col justify-center items-center w-full h-64 bg-secondary-50 rounded-lg border-2 border-secondary-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-secondary-700 hover:bg-secondary-100 dark:border-secondary-600 dark:hover:border-secondary-500 dark:hover:bg-secondary-600';"
                id="dropzone"
                ondrop={dropHandle}
                ondragover={(event) => {
                    event.preventDefault();
                  }}
                onclick={onClick}
        >
            <ArrowDownToBracketOutline class="w-10 h-10 me-2 dark:text-primary-50"/>
            <Label class="space-y-2">
                <p class="mb-2 text-sm text-secondary-500 dark:text-secondary-400"><span
                        class="font-semibold">Click to import </span> or drag and drop</p>
                <p class="text-xs text-secondary-500 dark:text-secondary-400">Valid file types: {file_extensions}</p>
            </Label>
        </button>
        <input class="hidden" type="file" accept={file_extensions} multiple={true} bind:this={file_selector}
               onchange={process_files}>
    </div>
</Modal>
