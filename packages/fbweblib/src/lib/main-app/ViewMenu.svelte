<script lang="ts">
    import {Checkbox, Dropdown, DropdownDivider, DropdownItem, NavLi} from 'flowbite-svelte';
    import {ChevronDownOutline} from 'flowbite-svelte-icons';
    import {projectionsShown, replaceProjectionsShown} from '$lib/stores/Projections.svelte';
    import {langInfo} from '$lib/stores/LanguageInfo.svelte';
    import {ProjectionItem} from "$lib/ts-utils/MenuItem";

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
        console.log('Apply Changes')
        // store the selection and enable/disable the projection
        const selection: string[] = [];
        allProjections.forEach(proj => {
            if (!!proj && proj.selected) {
                selection.push(proj.name);
            }
        });
        replaceProjectionsShown(selection);
        // EditorRequestsHandler.getInstance().enableProjections(selection);
        console.log('Currently shown: ' + projectionsShown)
    }
</script>

<NavLi class="cursor-pointer"
>View
    <ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>
</NavLi
>
<Dropdown class="z-20 w-44 space-y-3 p-3 text-sm">
    <li>
        <Checkbox checked disabled>Default</Checkbox>
    </li>
    {#each allProjections as option}
        {#if option !== null && option !== undefined}
            <li>
                <Checkbox onchange={() => !!option ? option.selected = !option.selected: null}
                          checked={option.selected}>{option ? option.name : "unknown view"}</Checkbox>
            </li>
        {/if}
    {/each}
    <DropdownDivider/>
    <DropdownItem onclick={() => applyChanges()}>Apply changes</DropdownItem>
</Dropdown>
