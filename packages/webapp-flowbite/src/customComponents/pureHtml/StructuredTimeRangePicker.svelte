<script lang="ts">
    import { onMount } from "svelte"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { PartReplacerBox, notNullOrUndefined } from "@freon4dsl/core"
    import { runInAction } from "mobx"
    import type { FreNode } from "@freon4dsl/core"

    /**
     * Note that this component only works when the following two concepts are used in the .ast definition.
     * concept TimeSlot {
     *   startTime: TimeValue;
     *   endTime: TimeValue;
     * }
     *
     * concept TimeValue {
     *   hour: number;
     *   minute: number;
     * }
     *
     * Import these types from ".../freon/index.js"
     */
    import { TimeSlot, TimeValue } from "@freon4dsl/samples-festival-planning"

    // Props
    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let startInput: HTMLInputElement
    let endInput: HTMLInputElement

    let startHm = $state("")
    let endHm = $state("")
    let endsNextDay = $state(false)

    const stopClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    function pad2(n: number): string {
        return String(n).padStart(2, "0")
    }

    function toHm(tv: TimeValue | null | undefined): string {
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

    function toMinutes(t: TimeValue): number {
        return t.hour * 60 + t.minute
    }

    function computeEndsNextDay(start: TimeValue, end: TimeValue): boolean {
        // strictly earlier only (your preference)
        return toMinutes(end) < toMinutes(start)
    }

    function getSlotFromModel(): { startTime: TimeValue; endTime: TimeValue } {
        const v: FreNode | undefined = box.getPropertyValue()
        if (notNullOrUndefined(v) && v.freLanguageConcept() === "TimeSlot") {
            const s = v as unknown as TimeSlot
            return { startTime: s.startTime, endTime: s.endTime }
        }

        const now = new globalThis.Date()
        const roundedMin = Math.round(now.getMinutes() / 15) * 15
        now.setMinutes(roundedMin, 0, 0)

        const start = TimeValue.create({ hour: now.getHours(), minute: now.getMinutes() })
        const end = TimeValue.create({ hour: (now.getHours() + 1) % 24, minute: now.getMinutes() })
        return { startTime: start, endTime: end }
    }

    function commitSlot(start: TimeValue, end: TimeValue) {
        let newSlot: TimeSlot | undefined = undefined
        runInAction(() => {
            newSlot = TimeSlot.create({ startTime: start, endTime: end })
        })
        if (notNullOrUndefined(newSlot)) {
            box.setPropertyValue(newSlot)
        }

        startHm = toHm(start)
        endHm = toHm(end)
        endsNextDay = computeEndsNextDay(start, end)
    }

    const onStartInput = () => {
        const s = fromHm(startHm)
        const e = fromHm(endHm)
        if (!s || !e) return
        commitSlot(s, e)
    }

    const onEndInput = () => {
        const s = fromHm(startHm)
        const e = fromHm(endHm)
        if (!s || !e) return
        commitSlot(s, e)
    }

    async function setFocus(): Promise<void> {
        startInput.focus()
    }

    const refresh = (_why?: string): void => {
        const { startTime, endTime } = getSlotFromModel()
        const s = toHm(startTime)
        const e = toHm(endTime)

        if (startHm !== s) startHm = s
        if (endHm !== e) endHm = e

        endsNextDay = computeEndsNextDay(startTime, endTime)
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => refresh())
</script>

<div class="time-range">
    <input
        type="time"
        step="60"
        bind:value={startHm}
        class="timepicker-input"
        onclick={stopClick}
        oninput={onStartInput}
        bind:this={startInput}
    />

    <span class="time-range-sep">until</span>

    <span class="end-wrap">
    <input
        type="time"
        step="60"
        bind:value={endHm}
        class="timepicker-input {endsNextDay ? 'nextday' : ''}"
        onclick={stopClick}
        oninput={onEndInput}
        bind:this={endInput}
    />

        {#if endsNextDay}
      <span class="nextday-badge" aria-label="Ends next day" title="Ends next day">+1</span>
    {/if}
  </span>
</div>

<style>
    .time-range {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0.5rem;
        flex-wrap: wrap;
    }

    .time-range-sep {
        opacity: 0.85;
        white-space: nowrap;
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

    /* Wrapper to position the badge relative to the input */
    .end-wrap {
        position: relative;
        display: inline-block;
    }

    /* A very subtle visual cue on the input itself */
    .timepicker-input.nextday {
        border-color: var(--color-light-accent-400);
        box-shadow: 0 0 0 2px var(--color-light-accent-100);
        padding-right: 2.25rem; /* make room for badge */
    }

    .nextday-badge {
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        font-size: 0.75rem;
        line-height: 1;
        padding: 0.2rem 0.35rem;
        border-radius: 999px;
        border: 1px solid var(--color-light-accent-300);
        background: var(--color-light-accent-100);
        color: var(--color-light-base-900);
        opacity: 0.9;
        pointer-events: none; /* don’t interfere with clicks into the input */
        user-select: none;
    }
</style>
