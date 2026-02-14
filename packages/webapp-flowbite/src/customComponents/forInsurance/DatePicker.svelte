<script lang="ts">
    import { StringReplacerBox, notNullOrUndefined } from "@freon4dsl/core"
    import type {FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<StringReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let value: string = $state("");
    getValue();

    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
    }

    const onChange = () => {
        let xx: Date | undefined = getValidDate(value)
        if (xx !== undefined) {
            console.log("Changing value to: " + value)
            box.setPropertyValue(value);
        } else {
            console.log("Value: " + value + " is not a valid date")
        }
    }

    /**
     * See if the date is in ISO or Dutch format and change it into ISO format for use in the <input> field.
     * @param d
     */
    function getValidDate(d: string): Date | undefined {
        if (!d) return undefined;

        // ISO format: YYYY-MM-DD
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
        // Dutch format: DD-MM-YYYY
        const dutchRegex = /^\d{2}-\d{2}-\d{4}$/;

        let year: number, month: number, day: number;

        if (isoRegex.test(d)) {
            // Already ISO
            [year, month, day] = d.split("-").map(Number);
        } else if (dutchRegex.test(d)) {
            // Convert Dutch to ISO ordering
            const [dd, mm, yyyy] = d.split("-").map(Number);
            year = yyyy;
            month = mm;
            day = dd;
        } else {
            console.warn("Unknown date format:", d);
            return undefined;
        }

        // Construct local date safely (avoids timezone shift)
        return new Date(year, month - 1, day);
    }

    function getValue() {
        let startStr: string | undefined = box.getPropertyValue();
        if (notNullOrUndefined(startStr) && startStr.length > 0) {
            value = startStr;
        } else {
            value = "2024-02-24";
        }
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue();
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // execute getValue on initialization
    getValue();
</script>

<div class="datepicker">
    <input
            id="default-datepicker"
            type="date"
            bind:value={value}
            class="datepicker-input"
            placeholder="Select date"
            onclick={onClick}
            onchange={onChange}
            bind:this={inputElement}
    />
</div>

<style>
    .datepicker {
        position: relative;
        max-width: 24rem;
    }
    .datepicker-input {
        background-color: rgb(249 250 251);
        border-width: 1px;
        border-color: rgb(209 213 219);
        color: rgb(17 24 39);
        font-size: 0.875rem; /* 14px */
        line-height: 1.25rem; /* 20px */
        border-radius: 0.5rem; /* 8px */
        display: block;
        width: 100%;
        padding-inline-start: 2.5rem; /* 40px */
        padding: 0.625rem; /* 10px */
    }
    .datepicker-input:focus {
        --tw-ring-color: rgb(59 130 246);
        border-color: rgb(59 130 246);
    }
</style>
