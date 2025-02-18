<script lang="ts">
    import DropdownComponent from '$lib/components/DropdownComponent.svelte';
    import type { SelectOption } from '@freon4dsl/core';

    let filteredOptions: SelectOption[] = [
        { id: 'xx', label: 'XXX' },
        { id: 'yy', label: 'YYY' },
        { id: 'zz', label: 'ZZZ' },
        { id: 'aa', label: 'AAA' }
    ];
    let dropdownShown: boolean = $state(true);
    let selected: SelectOption | undefined = $state({ id: 'xx', label: 'XXX' });

    const selectionChanged = (sel: SelectOption) => {
        console.log('new selection is ' + JSON.stringify(sel));
    };
</script>

<span>
    {#if selected !== undefined}
        <input bind:value={selected.label} />
        {#if dropdownShown}
            <DropdownComponent
                options={filteredOptions}
                bind:selected
                selectionChanged={(sel: SelectOption) => selectionChanged(sel)}
            />
        {/if}
        <span style="height:8rem">Current value: {selected.id}</span>
    {/if}
</span>
