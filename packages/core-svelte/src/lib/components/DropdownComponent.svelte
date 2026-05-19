<script lang="ts">
    import { ARROW_DOWN, ARROW_UP, MatchUtil, type SelectOption } from "@freon4dsl/core"
    import { DROPDOWN_LOGGER } from './ComponentLoggers.js';
    import type { DropdownProps } from './svelte-utils/FreComponentProps.js';

    let {
        allOptions = $bindable(),
        matchingOptions = $bindable(),
        selected = $bindable(),
        selectionChanged,
        filterOptions = false,
    }: DropdownProps = $props();

    let id: string = 'dropdown';
    const LOGGER = DROPDOWN_LOGGER;
    let matchCount = $derived(matchingOptions.length);
    let hasSingleMatch = $derived(matchCount === 1);
    let hasMultipleMatches = $derived(matchCount > 1);

    /* a small effect that keeps the variables valid */
    $effect(() => {
        visibleOptions;
        matchingOptions;
        filterOptions;

        if (visibleOptions.length === 0) {
            selected = undefined;
            return;
        }

        const stillVisible = visibleOptions.some(o => o.id === selected?.id);
        if (!stillVisible) {
            selected = matchingOptions.length > 0 ? matchingOptions[0] : visibleOptions[0];
        }
    });

    // Faster lookup for matching items
    let matchingIds = $derived.by(() => {
        return new Set(matchingOptions.map(o => o.id));
    });

    let visibleOptions = $derived.by(() => {
        return filterOptions ? matchingOptions : allOptions;
    });

    function isMatching(option: SelectOption): boolean {
        return matchingIds.has(option.id);
    }

    const handleClick = (option: SelectOption) => {
        // console.log(`handleClick ${option.label}`);
        selected = option;
        selectionChanged(option);
    };

    function selectFirstOption() {
        if (visibleOptions.length > 0) {
            selected = visibleOptions[0];
        }
    }

    function selectLastOption() {
        if (visibleOptions.length > 0) {
            selected = visibleOptions[visibleOptions.length - 1];
        }
    }

    /* NOTE: onArrowKey is called by the owner of the dropdown, not by an event listener
    * This makes sure the focus is still on the parent, e.g. an <input> in the parent still responds.
    * */
    export function onArrowKey(event: KeyboardEvent): void {
        console.log('onArrowKey', event.key);
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        switch (event.key) {
            case ARROW_DOWN: {
                if (visibleOptions.length === 0) {
                    break;
                }

                if (!selected) {
                    selectFirstOption();
                } else {
                    const index = visibleOptions.findIndex((o) => o.id === selected?.id);

                    if (index < 0) {
                        selectFirstOption();
                    } else if (index + 1 < visibleOptions.length) {
                        selected = visibleOptions[index + 1];
                    } else {
                        selectFirstOption();
                    }
                }

                event.preventDefault();
                event.stopPropagation();
                break;
            }

            case ARROW_UP: {
                if (visibleOptions.length === 0) {
                    break;
                }

                if (!selected) {
                    selectLastOption();
                } else {
                    const index = visibleOptions.findIndex((o) => o.id === selected?.id);

                    if (index < 0) {
                        selectLastOption();
                    } else if (index > 0) {
                        selected = visibleOptions[index - 1];
                    } else {
                        selectLastOption();
                    }
                }

                event.preventDefault();
                event.stopPropagation();
                break;
            }
        }
    }

    /**********************************************************************
     * Functions used for styling
     **********************************************************************/
    function itemClass(option: SelectOption): string {
        let result = "dropdown-component-item";

        if (option.id === selected?.id) {
            result += " dropdown-component-selected";
        }

        if (isMatching(option)) {
            if (hasSingleMatch) result += " matched";
            else if (hasMultipleMatches) result += " matched-multiple";

            if (isFirstMatch(option)) {
                result += " first-match";
            }
        }

        return result;
    }

    function isFirstMatch(option: SelectOption): boolean {
        return matchingOptions.length > 0 && matchingOptions[0].id === option.id;
    }

    const showMatchIndicators = $derived(matchingOptions.length > 0 &&
        matchingOptions.length < allOptions.length)
</script>

<div class="dropdown-component" {id}>
    {#if visibleOptions.length > 0}
        {#each visibleOptions as option (option.id)}
            <div
                class={itemClass(option)}
                onmousedown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleClick(option);
                }}
                role="none"
            >
                <span class="dropdown-component-item-main">
                    <span class="dropdown-component-item-label">
                        {option.label}
                    </span>

                    {#if option.additional_label}
                        <span class="dropdown-component-item-additional">
                            {option.additional_label}
                        </span>
                    {/if}
                </span>

                {#if !filterOptions}
                    <span class="dropdown-component-match-indicator">
                         {#if showMatchIndicators && isMatching(option)}✓{/if}
                    </span>
                {/if}
            </div>
        {/each}
    {:else}
        <div class="dropdown-component-error">No selection available</div>
    {/if}
</div>
