<script lang="ts">
    import { type SelectOption } from '@freon4dsl/core';
    import { DROPDOWN_LOGGER } from './ComponentLoggers.js';
    import type { DropdownProps } from './svelte-utils/FreComponentProps.js';
    import { usePaneContext } from "./svelte-utils/PaneLike.js";
    import { focusAndScrollIntoView } from './svelte-utils/ScrollingUtils.js';
    import { tick } from 'svelte';

    let {
        options = $bindable(),
        selected = $bindable(),
        selectionChanged
    }: DropdownProps = $props();
    let id: string = 'dropdown';
    let rootElement: HTMLSpanElement | undefined = $state(undefined);

    const LOGGER = DROPDOWN_LOGGER;

    const handleClick = (option: SelectOption) => {
        LOGGER.log('handleClick');
        selected = option;
        selectionChanged(option);
    };

    const pane = usePaneContext();

    export async function scrollIntoViewIfNeeded() {
        LOGGER.log('scrollIntoViewIfNeeded');

        // wait for DOM/layout before toggling visibility
        await tick();
        // wait one extra frame before trying to measure and scroll the dropdown,
        // layout + styles + images may not have been applied yet
        requestAnimationFrame(() => {
            // Prefixing with void is a stylistic way to say “Yes, I know this returns a promise; I don’t care about awaiting it here.”
            // Could also have been: focusAndScrollIntoView(rootEl, pane).catch(console.error);
            if (rootElement) void focusAndScrollIntoView(rootElement, pane);
        });
    }
</script>

<span class="dropdown-component-container" >
    <span class="dropdown-component" {id} bind:this={rootElement}>
        {#if options.length > 0}
            {#each options as option (option.id)}
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
