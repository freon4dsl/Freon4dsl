<script lang="ts">
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { StringReplacerBox } from "@freon4dsl/core"
    import { onMount } from "svelte"

    /**
     * Note that this component works when the date is represented by a string.
     * The string value will be in ISO format: "YYYY-MM-DD"
     */

    // Props
    let { box }: FreComponentProps<StringReplacerBox> = $props()

    let inputElement: HTMLInputElement
    let isoString = $state("")

    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    const onInput = () => {
        // Store raw ISO date string in the model (YYYY-MM-DD)
        box.setPropertyValue(isoString)
    }

    function isIsoDate(s: string): boolean {
        return /^\d{4}-\d{2}-\d{2}$/.test(s)
    }

    function todayIso(): string {
        return new globalThis.Date().toISOString().slice(0, 10)
    }

    function getValueFromModel(): string {
        const s = (box.getPropertyValue() ?? "").trim()
        return isIsoDate(s) ? s : todayIso()
    }

    // Freon hooks
    async function setFocus(): Promise<void> {
        inputElement.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const newIso = getValueFromModel()
        if (isoString !== newIso) {
            isoString = newIso
        }
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => {
        refresh()
    })
</script>

<div class="datepicker">
    <input
        type="date"
        bind:value={isoString}
        class="datepicker-input"
        placeholder="Select date"
        onclick={onClick}
        oninput={onInput}
        bind:this={inputElement}
    />
</div>

<style>
    .datepicker {
        position: relative;
        max-width: 24rem;
        margin: 0 0.5rem;
    }

    .datepicker-input {
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--color-light-base-300);
        background-color: var(--color-light-base-100);
        color: var(--color-light-base-900);
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    .datepicker-input:focus {
        outline: none;
        border-color: var(--color-light-accent-400);
        box-shadow: 0 0 0 2px var(--color-light-accent-200);
    }

    .datepicker-input::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.8;
    }

    .datepicker-input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
    }
</style>
