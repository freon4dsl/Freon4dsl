<script lang="ts">
    import {BooleanReplacerBox, isNullOrUndefined} from "@freon4dsl/core";
    import {type FreComponentProps} from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<BooleanReplacerBox> = $props();

    let inputElement: HTMLInputElement;
    let value: string = $state("true");

    function getValue() {
        let startVal: boolean | undefined = box.getPropertyValue();
        if (!isNullOrUndefined(startVal)) {
            value = startVal.toString();
        }
    }

    const onChange = () => {
        if (value === "true") {
            box.setPropertyValue(true);
        } else if (value === "false") {
            box.setPropertyValue(false);
        }
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getValue()
    };
    $effect(() => {
        getValue()
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    Boolean Replacer
    <input bind:value={value} bind:this={inputElement} onchange={onChange}/>
</div>
