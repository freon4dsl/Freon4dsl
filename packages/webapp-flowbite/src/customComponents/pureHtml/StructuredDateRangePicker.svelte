<script lang="ts">
    import { onMount } from "svelte"
    import { DateValue, DateRange, Schedule } from "@freon4dsl/samples-festival-planning"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { runInAction } from "mobx"

    // Props
    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let startInput: HTMLInputElement
    let endInput: HTMLInputElement

    let startIso = $state("")
    let endIso = $state("")

    let endAutoCorrected = $state(false)
    let autoCorrectTimer: number | undefined

    const stopClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    function toIso(date: DateValue | null | undefined): string {
        if (!date) return ""
        const y = String(date.year).padStart(4, "0")
        const m = String(date.month).padStart(2, "0")
        const d = String(date.day).padStart(2, "0")
        return `${y}-${m}-${d}`
    }

    function fromIso(iso: string): DateValue | null {
        if (!iso) return null
        const [y, m, d] = iso.split("-").map(Number)
        return DateValue.create({ year: y, month: m, day: d })
    }

    function toJsDate(d: DateValue): globalThis.Date {
        // local date, avoids UTC shifting surprises for "date-only" values
        return new globalThis.Date(d.year, d.month - 1, d.day)
    }

    function fromJsDate(dt: globalThis.Date): DateValue {
        return DateValue.create({
            year: dt.getFullYear(),
            month: dt.getMonth() + 1,
            day: dt.getDate(),
        })
    }

    function addDays(d: DateValue, days: number): DateValue {
        const js = toJsDate(d)
        js.setDate(js.getDate() + days)
        return fromJsDate(js)
    }

    function isAfter(a: DateValue, b: DateValue): boolean {
        // true if a > b (strictly after)
        return toJsDate(a).getTime() > toJsDate(b).getTime()
    }

    function normalizeRange(start: DateValue, end: DateValue): { start: DateValue; end: DateValue } {
        // enforce end > start; if not, push end to start + 1 day
        if (!isAfter(end, start)) {
            return { start, end: addDays(start, 1) }
        }
        return { start, end }
    }

    function getRangeFromModel(): { start: DateValue; end: DateValue } {
        const v: FreNode | undefined = box.getPropertyValue()

        if (notNullOrUndefined(v) && v.freLanguageConcept() === "DateRange") {
            const r = v as unknown as DateRange
            // assuming start/end always exist
            return normalizeRange(r.start, r.end)
        }

        // default: today .. tomorrow
        const todayIso = new globalThis.Date().toISOString().slice(0, 10)
        const today = fromIso(todayIso) ?? DateValue.create({ year: 2000, month: 1, day: 1 })
        return { start: today, end: addDays(today, 1) }
    }

    const refresh = (_why?: string): void => {
        const { start, end } = getRangeFromModel()
        const s = toIso(start)
        const e = toIso(end)

        if (startIso !== s) startIso = s
        if (endIso !== e) endIso = e
    }

    function commitRange(start: DateValue, end: DateValue) {
        const normalized = normalizeRange(start, end)
        const wasCorrected = !isAfter(end, start) // i.e. we had to push end forward
        // write to model
        let newRange: DateRange | undefined = undefined;
        runInAction(() => {
            newRange = DateRange.create(normalized)
        });
        if (notNullOrUndefined(newRange)) {
            box.setPropertyValue(newRange)
        }
        // keep UI consistent immediately
        startIso = toIso(normalized.start)
        endIso = toIso(normalized.end)
        if (wasCorrected) {
            endAutoCorrected = true
            if (autoCorrectTimer) window.clearTimeout(autoCorrectTimer)
            autoCorrectTimer = window.setTimeout(() => {
                endAutoCorrected = false
            }, 2500)
        }
    }

    const onStartInput = () => {
        const s = fromIso(startIso)
        const e = fromIso(endIso)
        if (!s || !e) return
        commitRange(s, e)
    }

    const onEndInput = () => {
        const s = fromIso(startIso)
        const e = fromIso(endIso)
        if (!s || !e) return
        commitRange(s, e)
    }

    // Freon hooks
    async function setFocus(): Promise<void> {
        startInput.focus()
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => {
        refresh()
    })
</script>

<div class="date-range">
    <input
        type="date"
        bind:value={startIso}
        class="datepicker-input"
        onclick={stopClick}
        oninput={onStartInput}
        bind:this={startInput}
    />

    <span class="date-range-sep">until</span>

    <input
        type="date"
        bind:value={endIso}
        class="datepicker-input {endAutoCorrected ? 'autocorrected' : ''}"
        onclick={stopClick}
        oninput={onEndInput}
        bind:this={endInput}
    />
</div>
{#if endAutoCorrected}
    <div class="text-sm opacity-80 mt-1">
        End date was adjusted to be after the start date.
    </div>
{/if}

<style>
    .date-range {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0.5rem;
        flex-wrap: wrap;
    }

    .date-range-sep {
        opacity: 0.85;
        white-space: nowrap;
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
    .datepicker-input.autocorrected {
        border-color: var(--color-light-accent-500);
        box-shadow: 0 0 0 2px var(--color-light-accent-200);
        animation: bump 250ms ease-out;
    }

    @keyframes bump {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
</style>
