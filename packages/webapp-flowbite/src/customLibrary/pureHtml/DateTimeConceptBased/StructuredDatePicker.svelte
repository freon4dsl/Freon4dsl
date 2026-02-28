<script lang="ts">
    import { DateValue } from "@freon4dsl/samples-festival-planning"
    import { PartReplacerBox, notNullOrUndefined, type FreNode } from "@freon4dsl/core"
    import type {FreComponentProps} from "@freon4dsl/core-svelte";
    import { onMount } from "svelte"

    // Props
    let { box }: FreComponentProps<PartReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let isoString = $state("")

    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
    }

    const onInput = () => {
        const dv = fromIso(isoString)
        if (dv) {
            box.setPropertyValue(dv)
        }
    }

    function getValueFromModel(): string {
        const v: FreNode | undefined = box.getPropertyValue()
        if (notNullOrUndefined(v) && v.freLanguageConcept() === "DateValue") {
            return toIso(v as DateValue)
        }
        // your “today” default
        return new globalThis.Date().toISOString().slice(0, 10)
    }

    function toIso(date: DateValue | null): string {
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

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus()
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        const newIso = getValueFromModel()
        if (isoString !== newIso) {
            isoString = newIso
        }
    };
    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
    });

    onMount(() => {
        refresh()
    })
</script>

<div class="datepicker">
    <input
            id="default-datepicker"
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
