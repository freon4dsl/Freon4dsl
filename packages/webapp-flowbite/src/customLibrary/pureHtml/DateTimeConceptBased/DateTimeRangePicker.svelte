<script lang="ts">
    import { onMount } from "svelte"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { runInAction } from "mobx"

    /**
     * Works with:
     * concept DateTimeRange { start: DateTime; end: DateTime; }
     * concept DateTime { date: DateValue; time: TimeValue; }
     * concept DateValue { year:number; month:number; day:number; }
     * concept TimeValue { hour:number; minute:number; }
     *
     * Import from ".../freon/index.js"
     */
    import { DateTimeRange, DateTime, DateValue, TimeValue } from "@freon4dsl/samples-festival-planning"

    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let startDateEl: HTMLInputElement
    let startTimeEl: HTMLInputElement
    let endDateEl: HTMLInputElement
    let endTimeEl: HTMLInputElement

    let sDate = $state("")
    let sTime = $state("")
    let eDate = $state("")
    let eTime = $state("")

    let endAutoCorrected = $state(false)
    let autoCorrectTimer: number | undefined

    const stopClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    function pad2(n: number) { return String(n).padStart(2, "0") }

    function dateToIso(d: DateValue): string {
        return `${String(d.year).padStart(4, "0")}-${pad2(d.month)}-${pad2(d.day)}`
    }
    function isoToDate(iso: string): DateValue | null {
        if (!iso) return null
        const [y, m, d] = iso.split("-").map(Number)
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
        return DateValue.create({ year: y, month: m, day: d })
    }

    function timeToHm(t: TimeValue): string { return `${pad2(t.hour)}:${pad2(t.minute)}` }
    function hmToTime(hm: string): TimeValue | null {
        if (!hm) return null
        const [h, m] = hm.split(":").map(Number)
        if (!Number.isFinite(h) || !Number.isFinite(m)) return null
        if (h < 0 || h > 23 || m < 0 || m > 59) return null
        return TimeValue.create({ hour: h, minute: m })
    }

    function toJs(dt: DateTime): globalThis.Date {
        return new globalThis.Date(
            dt.date.year,
            dt.date.month - 1,
            dt.date.day,
            dt.time.hour,
            dt.time.minute,
            0,
            0
        )
    }

    function fromJs(js: globalThis.Date): DateTime {
        return DateTime.create({
            date: DateValue.create({ year: js.getFullYear(), month: js.getMonth() + 1, day: js.getDate() }),
            time: TimeValue.create({ hour: js.getHours(), minute: js.getMinutes() }),
        })
    }

    function isAfter(a: DateTime, b: DateTime): boolean {
        return toJs(a).getTime() > toJs(b).getTime()
    }

    function normalize(start: DateTime, end: DateTime): { start: DateTime; end: DateTime } {
        // If end <= start, push end by +60 minutes
        if (!isAfter(end, start)) {
            const js = toJs(start)
            js.setMinutes(js.getMinutes() + 60)
            return { start, end: fromJs(js) }
        }
        return { start, end }
    }

    function getFromModel(): { start: DateTime; end: DateTime } {
        const v: FreNode | undefined = box.getPropertyValue()
        if (notNullOrUndefined(v) && !Array.isArray(v) && v.freLanguageConcept() === "DateTimeRange") {
            const a = v as unknown as DateTimeRange
            return normalize(a.start, a.end)
        }

        // default: now .. +60 minutes
        const now = new globalThis.Date()
        const roundedMin = Math.round(now.getMinutes() / 5) * 5
        now.setMinutes(roundedMin, 0, 0)
        const start = fromJs(now)
        const end = fromJs(new globalThis.Date(now.getTime() + 60 * 60 * 1000))
        return { start, end }
    }

    function commit(start: DateTime, end: DateTime) {
        const normalized = normalize(start, end)
        const wasCorrected = !isAfter(end, start)

        let newAvail: DateTimeRange | undefined
        runInAction(() => {
            newAvail = DateTimeRange.create(normalized)
        })
        if (notNullOrUndefined(newAvail)) {
            box.setPropertyValue(newAvail)
        }

        // keep UI consistent
        sDate = dateToIso(normalized.start.date)
        sTime = timeToHm(normalized.start.time)
        eDate = dateToIso(normalized.end.date)
        eTime = timeToHm(normalized.end.time)

        if (wasCorrected) {
            endAutoCorrected = true
            if (autoCorrectTimer) window.clearTimeout(autoCorrectTimer)
            autoCorrectTimer = window.setTimeout(() => (endAutoCorrected = false), 2500)
        }
    }

    function readUi(): { start: DateTime; end: DateTime } | null {
        const sd = isoToDate(sDate)
        const st = hmToTime(sTime)
        const ed = isoToDate(eDate)
        const et = hmToTime(eTime)
        if (!sd || !st || !ed || !et) return null
        return {
            start: DateTime.create({ date: sd, time: st }),
            end: DateTime.create({ date: ed, time: et }),
        }
    }

    const onAnyInput = () => {
        const ui = readUi()
        if (!ui) return
        commit(ui.start, ui.end)
    }

    async function setFocus(): Promise<void> {
        startDateEl.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const { start, end } = getFromModel()

        sDate = dateToIso(start.date)
        sTime = timeToHm(start.time)
        eDate = dateToIso(end.date)
        eTime = timeToHm(end.time)
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => refresh())
</script>

<div class="availability">
    <div class="row">
        <span class="sep">start</span>
        <input type="date" bind:value={sDate} class="dt-input" onclick={stopClick} oninput={onAnyInput} bind:this={startDateEl} />
        <input type="time" step="60" bind:value={sTime} class="dt-input" onclick={stopClick} oninput={onAnyInput} bind:this={startTimeEl} />
    </div>

    <div class="row">
        <span class="sep">end</span>
        <input
            type="date"
            bind:value={eDate}
            class="dt-input {endAutoCorrected ? 'autocorrected' : ''}"
            onclick={stopClick}
            oninput={onAnyInput}
            bind:this={endDateEl}
        />
        <input
            type="time"
            step="60"
            bind:value={eTime}
            class="dt-input {endAutoCorrected ? 'autocorrected' : ''}"
            onclick={stopClick}
            oninput={onAnyInput}
            bind:this={endTimeEl}
        />
    </div>
</div>

{#if endAutoCorrected}
    <div class="text-sm opacity-80 mt-1">
        End was adjusted to be after the start.
    </div>
{/if}

<style>
    .availability {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 0 0.5rem;
    }

    .row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .sep {
        opacity: 0.85;
        width: 3.2rem;
        white-space: nowrap;
    }

    .dt-input {
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--color-light-base-300);
        background-color: var(--color-light-base-100);
        color: var(--color-light-base-900);
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    .dt-input:focus {
        outline: none;
        border-color: var(--color-light-accent-400);
        box-shadow: 0 0 0 2px var(--color-light-accent-200);
    }

    .dt-input.autocorrected {
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
