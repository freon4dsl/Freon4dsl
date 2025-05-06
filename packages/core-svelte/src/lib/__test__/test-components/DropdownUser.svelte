<script lang="ts">
    import DropdownComponent from '../../components/DropdownComponent.svelte';
    import type { SelectOption } from '@freon4dsl/core';

    let filteredOptions: SelectOption[] = [
        { id: 'xx', label: 'XXX', additional_label: 'from SS' },
        { id: 'yy', label: 'YYY', additional_label: 'from ZZZZZZ' },
        { id: 'zz', label: 'ZZZ', additional_label: 'from Somewhere' },
        { id: 'aa', label: 'AAA', additional_label: 'from TTT' }
    ];
    let dropdownShown: boolean = $state(true);
    let selected: SelectOption | undefined = $state({ id: 'xx', label: 'XXX' });

    let newSelected: {value: string | undefined} = $state({ value: 'xx' });

    const selectionChanged = (sel: SelectOption) => {
        newSelected.value = JSON.stringify(sel);
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
        <span>{newSelected.value}</span>
    {/if}
</span>
