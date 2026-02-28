<script lang="ts">
    /**
     * Note that this component only works when the following concept is used in the .ast definition.
     * concept TimeRangeString {
     *     start: string;  // "HH:MM"
     *     end: string;    // "HH:MM"
     * }
     */

    import { onMount } from "svelte"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { runInAction } from "mobx"
    import { TimeRangeString } from "@freon4dsl/samples-festival-planning"

    // Props
    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let startInput: HTMLInputElement
    let endInput: HTMLInputElement

    let startHm = $state("")
    let endHm = $state("")

    // UI hint: end wraps to next day if earlier than start
    let endsNextDay = $state(false)

    const stopClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    function pad2(n: number): string {
        return String(n).padStart(2, "0")
    }

    function isHm(s: string): boolean {
        return /^\d{2}:\d{2}$/.test(s)
    }

    function toMinutes(hm: string): number {
        const [h, m] = hm.split(":").map(Number)
        return h * 60 + m
    }

    function computeEndsNextDay(start: string, end: string): boolean {
        if (!isHm(start) || !isHm(end)) return false
        // strictly earlier only (00:30 after 23:00 => next day)
        return toMinutes(end) < toMinutes(start)
    }

    function nowRoundedIso(stepMinutes = 15): string {
        const now = new globalThis.Date()
        const rounded = Math.round(now.getMinutes() / stepMinutes) * stepMinutes
        now.setMinutes(rounded, 0, 0)
        return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    }

    function plusMinutes(hm: string, minutes: number): string {
        if (!isHm(hm)) return hm
        const total = toMinutes(hm) + minutes
        const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
        return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`
    }

    function getRangeFromModel(): { start: string; end: string } {
        const v: FreNode | undefined = box.getPropertyValue()

        if (notNullOrUndefined(v) && v.freLanguageConcept() === "TimeRangeString") {
            const r = v as unknown as TimeRangeString
            const s = (r.start ?? "").trim()
            const e = (r.end ?? "").trim()

            // If model already valid, keep it as-is
            if (isHm(s) && isHm(e)) return { start: s, end: e }
        }

        // default: now rounded .. +60 mins (wrap allowed)
        const start = nowRoundedIso(15)
        const end = plusMinutes(start, 60)
        return { start, end }
    }

    function commitRange(start: string, end: string) {
        if (!isHm(start) || !isHm(end)) return

        // write to model (NO normalization; wrap is allowed)
        let newRange: TimeRangeString | undefined = undefined
        runInAction(() => {
            newRange = TimeRangeString.create({ start, end })
        })
        if (notNullOrUndefined(newRange)) {
            box.setPropertyValue(newRange)
        }

        // keep UI consistent immediately
        startHm = start
        endHm = end
        endsNextDay = computeEndsNextDay(start, end)
    }

    const onStartInput = () => {
        if (!startHm || !endHm) return
        commitRange(startHm, endHm)
    }

    const onEndInput = () => {
        if (!startHm || !endHm) return
        commitRange(startHm, endHm)
    }

    // Freon hooks
    async function setFocus(): Promise<void> {
        startInput.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const { start, end } = getRangeFromModel()

        if (startHm !== start) startHm = start
        if (endHm !== end) endHm = end

        endsNextDay = computeEndsNextDay(start, end)
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => {
        refresh()
    })
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

    /* Badge wrapper */
    .end-wrap {
        position: relative;
        display: inline-block;
    }

    /* Subtle cue on the input itself */
    .timepicker-input.nextday {
        border-color: var(--color-light-accent-400);
        box-shadow: 0 0 0 2px var(--color-light-accent-100);
        padding-right: 2.25rem; /* room for badge */
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
        pointer-events: none;
        user-select: none;
    }
</style>
