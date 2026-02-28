<script lang="ts">
    import { StringReplacerBox } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { onMount } from "svelte"

    /**
     * Note that this component works when the time is represented by a string.
     * The string value will be in ISO format: "HH:MM"
     */

    // Props
    let { box }: FreComponentProps<StringReplacerBox> = $props()

    let inputElement: HTMLInputElement
    let hmString = $state("")

    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    const onInput = () => {
        // Store raw "HH:MM" string in the model
        box.setPropertyValue(hmString)
    }

    function pad2(n: number): string {
        return String(n).padStart(2, "0")
    }

    function isHm(s: string): boolean {
        // Basic "HH:MM" check; input[type=time] will also produce this
        return /^\d{2}:\d{2}$/.test(s)
    }

    function nowRounded(stepMinutes = 5): string {
        const now = new globalThis.Date()
        const roundedMin = Math.round(now.getMinutes() / stepMinutes) * stepMinutes
        now.setMinutes(roundedMin, 0, 0)
        return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    }

    function getValueFromModel(): string {
        const v = (box.getPropertyValue() ?? "").trim()
        if (isHm(v)) return v
        // default: current time (rounded to 5 minutes)
        return nowRounded(5)
    }

    // Freon hooks
    async function setFocus(): Promise<void> {
        inputElement.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const newHm = getValueFromModel()
        if (hmString !== newHm) {
            hmString = newHm
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

<div class="timepicker">
    <input
        type="time"
        step="60"
        bind:value={hmString}
        class="timepicker-input"
        placeholder="Select time"
        onclick={onClick}
        oninput={onInput}
        bind:this={inputElement}
    />
</div>

<style>
    .timepicker {
        position: relative;
        max-width: 24rem;
        margin: 0 0.5rem;
    }

    .timepicker-input {
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--color-light-base-300);
        background-color: var(--color-light-base-100);
        color: var(--color-light-base-900);
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    .timepicker-input:focus {
        outline: none;
        border-color: var(--color-light-accent-400);
        box-shadow: 0 0 0 2px var(--color-light-accent-200);
    }

    .timepicker-input::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.8;
    }

    .timepicker-input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
    }
</style>
