<script lang="ts">
    import { onMount } from "svelte"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { runInAction } from "mobx"

    /**
     * Works with:
     * concept DateTime { date: DateValue; time: TimeValue; }
     * concept DateValue { year:number; month:number; day:number; }
     * concept TimeValue { hour:number; minute:number; }
     *
     * Import from ".../freon/index.js"
     */
    import { DateTime, DateValue, TimeValue } from "@freon4dsl/samples-festival-planning"

    let { box }: FreComponentProps<PartReplacerBox> = $props()

    let dateEl: HTMLInputElement
    let timeEl: HTMLInputElement

    let dateIso = $state("") // YYYY-MM-DD
    let timeHm = $state("")  // HH:MM

    const stopClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation()
    }

    function pad2(n: number): string {
        return String(n).padStart(2, "0")
    }

    function dateToIso(d: DateValue | null | undefined): string {
        if (!d) return ""
        const y = String(d.year).padStart(4, "0")
        const m = String(d.month).padStart(2, "0")
        const dd = String(d.day).padStart(2, "0")
        return `${y}-${m}-${dd}`
    }

    function isoToDate(iso: string): DateValue | null {
        if (!iso) return null
        const [y, m, d] = iso.split("-").map(Number)
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
        return DateValue.create({ year: y, month: m, day: d })
    }

    function timeToHm(t: TimeValue | null | undefined): string {
        if (!t) return ""
        return `${pad2(t.hour)}:${pad2(t.minute)}`
    }

    function hmToTime(hm: string): TimeValue | null {
        if (!hm) return null
        const [h, m] = hm.split(":").map(Number)
        if (!Number.isFinite(h) || !Number.isFinite(m)) return null
        if (h < 0 || h > 23 || m < 0 || m > 59) return null
        return TimeValue.create({ hour: h, minute: m })
    }

    function getFromModel(): { date: DateValue; time: TimeValue } {
        const v: FreNode | undefined = box.getPropertyValue()

        if (notNullOrUndefined(v) && v.freLanguageConcept() === "DateTime") {
            const dt = v as unknown as DateTime
            return { date: dt.date, time: dt.time }
        }

        // default: today + now (rounded to 5 mins)
        const now = new globalThis.Date()
        const roundedMin = Math.round(now.getMinutes() / 5) * 5
        now.setMinutes(roundedMin, 0, 0)

        const date = DateValue.create({
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        })
        const time = TimeValue.create({ hour: now.getHours(), minute: now.getMinutes() })

        return { date, time }
    }

    function commit(date: DateValue, time: TimeValue) {
        let newDt: DateTime | undefined
        runInAction(() => {
            newDt = DateTime.create({ date, time })
        })
        if (notNullOrUndefined(newDt)) {
            box.setPropertyValue(newDt)
        }

        // keep UI consistent
        dateIso = dateToIso(date)
        timeHm = timeToHm(time)
    }

    const onDateInput = () => {
        const d = isoToDate(dateIso)
        const t = hmToTime(timeHm)
        if (!d || !t) return
        commit(d, t)
    }

    const onTimeInput = () => {
        const d = isoToDate(dateIso)
        const t = hmToTime(timeHm)
        if (!d || !t) return
        commit(d, t)
    }

    async function setFocus(): Promise<void> {
        dateEl.focus()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        const { date, time } = getFromModel()
        const d = dateToIso(date)
        const t = timeToHm(time)
        if (dateIso !== d) dateIso = d
        if (timeHm !== t) timeHm = t
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    })

    onMount(() => refresh())
</script>

<div class="datetime-picker">
    <input
        type="date"
        bind:value={dateIso}
        class="dt-input"
        onclick={stopClick}
        oninput={onDateInput}
        bind:this={dateEl}
    />
    <input
        type="time"
        step="60"
        bind:value={timeHm}
        class="dt-input"
        onclick={stopClick}
        oninput={onTimeInput}
        bind:this={timeEl}
    />
</div>

<style>
    .datetime-picker {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
        margin: 0 0.5rem;
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
</style>
