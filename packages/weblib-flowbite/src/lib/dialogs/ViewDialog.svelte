<script lang="ts">
    import {Button, Checkbox, Modal} from 'flowbite-svelte';
    import {projectionsShown, replaceProjectionsShown} from '$lib/stores/Projections.svelte';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {ProjectionItem} from "$lib/ts-utils/MenuItem";
    import {dialogs} from "$lib";
    import {isNullOrUndefined} from "@freon4dsl/core";
    import { EditorRequestsHandler, WebappConfigurator } from "$lib/language"
    import { cancelButtonClass, okButtonClass } from '$lib/stores/StylesStore.svelte';
    import { PenSolid } from 'flowbite-svelte-icons';

    let allProjections: (ProjectionItem | undefined)[] = $derived(
        langInfo.projectionNames.map(view => {
            let selected: boolean = false;
            if (view !== 'default') {
                if (projectionsShown.includes(view)) {
                    selected = true;
                }
                return new ProjectionItem(view, selected);
            }
        })
    );

    function applyChanges() {
        // console.log('Apply Changes')
        // store the selection and enable/disable the projection
        const selection: string[] = [];
        allProjections.forEach(proj => {
            if (!!proj && proj.selected) {
                selection.push(proj.name);
            }
        });
        replaceProjectionsShown(selection);
        EditorRequestsHandler.getInstance().enableProjections(selection);
        // console.log('Currently shown: ' + projectionsShown)
    }
</script>

<Modal title="Select the projections to be shown" bind:open={dialogs.selectViewsDialogVisible} size="xs" autoclose outsideclose
       class="w-full bg-light-base-100 dark:bg-dark-base-800">
    <Checkbox checked disabled>Default</Checkbox>
    {#each allProjections as option}
        {#if !isNullOrUndefined(option)}
            <Checkbox onchange={() => !isNullOrUndefined(option) ? option.selected = !option.selected: null}
                      checked={option.selected}>{option ? option.name : "unknown view"}</Checkbox>
        {/if}
    {/each}

    <div class="mt-4 flex flex-row justify-end">
        <Button class={okButtonClass} onclick={() => applyChanges()} >
            Apply changes
        </Button>
    </div>
</Modal>
