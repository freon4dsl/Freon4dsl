<script lang="ts">
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { onMount } from "svelte"

    /**
     * Note that this component only works when the following concept is used in the .ast definition.
     *
     * concept TimeValue {
     *   hour: number;
     *   minute: number;
     * }
     * Import this type from ".../freon/index.js"
     */
    import { TimeValue } from "@freon4dsl/samples-festival-planning"


    // Props
    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let inputElement: HTMLInputElement
    let hmString = $state("")

    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    const onInput = () => {
        const tv = fromHm(hmString)
        if (tv) {
            box.setPropertyValue(tv)
        }
    }

    function pad2(n: number): string {
        return String(n).padStart(2, "0")
    }

    function getValueFromModel(): string {
        const v: FreNode | undefined = box.getPropertyValue()
        if (notNullOrUndefined(v) && v.freLanguageConcept() === "TimeValue") {
            return toHm(v as TimeValue)
        }
        // default: current time (rounded to 5 minutes)
        const now = new globalThis.Date()
        const roundedMin = Math.round(now.getMinutes() / 5) * 5
        now.setMinutes(roundedMin, 0, 0)
        return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    }

    function toHm(tv: TimeValue | null): string {
        if (!tv) return ""
        return `${pad2(tv.hour)}:${pad2(tv.minute)}`
    }

    function fromHm(hm: string): TimeValue | null {
        if (!hm) return null
        const [h, m] = hm.split(":").map(Number)
        if (!Number.isFinite(h) || !Number.isFinite(m)) return null
        if (h < 0 || h > 23 || m < 0 || m > 59) return null
        return TimeValue.create({ hour: h, minute: m })
    }

    // The following three functions need to be included for the editor to function properly.
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
