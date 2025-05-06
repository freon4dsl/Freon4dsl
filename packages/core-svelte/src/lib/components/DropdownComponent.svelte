<script lang="ts">
    import { type SelectOption } from '@freon4dsl/core';
    import { DROPDOWN_LOGGER } from '$lib/components/ComponentLoggers.js';
    import type { DropdownProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    let {
        options = $bindable(),
        selected = $bindable(),
        selectionChanged
    }: DropdownProps = $props();
    let id: string = 'dropdown';

    const LOGGER = DROPDOWN_LOGGER;

    const handleClick = (option: SelectOption) => {
        LOGGER.log('handleClick');
        selected = option;
        selectionChanged(option);
    };
</script>

<span class="dropdown-component-container">
    <span class="dropdown-component" {id}>
        {#if options.length > 0}
            {#each options as option (option.id + option.label)}
                <div
                    class="dropdown-component-item"
                    class:dropdown-component-selected={options.length === 1 ||
                        option.id === selected?.id}
                    onmousedown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleClick(option);
                    }}
                    role="none"
                >
                    {#if option.additional_label}
                        <span class="dropdown-entry-with-additional-label">
                            <span class="column-for-dropdown-entry-with-additional-label">{option.label}</span>
                            <span class="gap-for-dropdown-entry-with-additional-label">&nbsp;</span>
                            <span class="column-for-dropdown-entry-with-additional-label">{option.additional_label}</span>
                        </span>
                    {:else}
                        {option.label}
                    {/if}
                </div>
            {/each}
        {:else}
            <div class="dropdown-component-error">No selection available</div>
        {/if}
    </span>
</span>

<style>
    .dropdown-component-container {
        position: relative;
    }
    .dropdown-entry-with-additional-label {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        box-sizing: border-box;
        width: 100%;
    }
    .column-for-dropdown-entry-with-additional-label {
        display: flex;
        flex-direction: column;
        /*flex: 1;*/
    }
    .gap-for-dropdown-entry-with-additional-label {
        margin: 0 0.7rem 0 0.7rem;
        flex: 1;
    }
</style>
