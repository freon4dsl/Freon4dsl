<script lang="ts">
    import { onMount } from "svelte"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { runInAction } from "mobx"

    /**
     * Note that this component only works when the following concept is used in the .ast definition.
     * concept DateRangeString {
     *     start: string;  // ISO "YYYY-MM-DD"
     *     end: string;    // ISO "YYYY-MM-DD"
     * }
     * Import it from "...freon/index.js"
     */
    import { DateRangeString } from "@freon4dsl/samples-festival-planning"

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

    function isIsoDate(s: string): boolean {
        return /^\d{4}-\d{2}-\d{2}$/.test(s)
    }

    function toJsDate(iso: string): globalThis.Date {
        const [y, m, d] = iso.split("-").map(Number)
        return new globalThis.Date(y, m - 1, d)
    }

    function fromJsDate(dt: globalThis.Date): string {
        const y = String(dt.getFullYear()).padStart(4, "0")
        const m = String(dt.getMonth() + 1).padStart(2, "0")
        const d = String(dt.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
    }

    function addDays(iso: string, days: number): string {
        const js = toJsDate(iso)
        js.setDate(js.getDate() + days)
        return fromJsDate(js)
    }

    function isAfter(aIso: string, bIso: string): boolean {
        return toJsDate(aIso).getTime() > toJsDate(bIso).getTime()
    }

    function normalizeRange(start: string, end: string): { start: string; end: string } {
        // enforce end > start; if not, push end to start + 1 day
        if (!isAfter(end, start)) {
            return { start, end: addDays(start, 1) }
        }
        return { start, end }
    }

    function todayIso(): string {
        return new globalThis.Date().toISOString().slice(0, 10)
    }

    function getRangeFromModel(): { start: string; end: string } {
        const v: FreNode | undefined = box.getPropertyValue()

        if (notNullOrUndefined(v) && v.freLanguageConcept() === "DateRangeString") {
            const r = v as unknown as DateRangeString
            const s = (r.start ?? "").trim()
            const e = (r.end ?? "").trim()

            if (isIsoDate(s) && isIsoDate(e)) {
                return normalizeRange(s, e)
            }

            // If model contains non-ISO strings, fall back to safe defaults
            const t = todayIso()
            return { start: t, end: addDays(t, 1) }
        }

        // default: today .. tomorrow
        const t = todayIso()
        return { start: t, end: addDays(t, 1) }
    }

    function commitRange(start: string, end: string) {
        if (!isIsoDate(start) || !isIsoDate(end)) return

        const normalized = normalizeRange(start, end)
        const wasCorrected = !isAfter(end, start)

        // write to model
        let newRange: DateRangeString | undefined = undefined
        runInAction(() => {
            newRange = DateRangeString.create(normalized)
        })
        if (notNullOrUndefined(newRange)) {
            box.setPropertyValue(newRange)
        }

        // keep UI consistent immediately
        startIso = normalized.start
        endIso = normalized.end

        if (wasCorrected) {
            endAutoCorrected = true
            if (autoCorrectTimer) window.clearTimeout(autoCorrectTimer)
            autoCorrectTimer = window.setTimeout(() => {
                endAutoCorrected = false
            }, 2500)
        }
    }

    const onStartInput = () => {
        if (!startIso || !endIso) return
        commitRange(startIso, endIso)
    }

    const onEndInput = () => {
        if (!startIso || !endIso) return
        commitRange(startIso, endIso)
    }

    // Freon hooks
    async function setFocus(): Promise<void> {
        startInput.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const { start, end } = getRangeFromModel()

        if (startIso !== start) startIso = start
        if (endIso !== end) endIso = end
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
