<script lang="ts">
    import { ExternalNumberBox} from "@freon4dsl/core";
    import { type FreComponentProps } from "@freon4dsl/core-svelte";

    // Props
    let { editor, box }: FreComponentProps<ExternalNumberBox> = $props();

    let inputElement;
    let value: string = $state('');

    function getValue() {
        let startVal: number | undefined = box.getPropertyValue();
        if (typeof startVal === "number") {
            value = startVal.toString();
        } else {
            value = "0"; // the default
        }
    }
    getValue();

    const onChange = () => {
        if (!!value && value.length > 0) {
            box.setPropertyValue(Number.parseInt(value));
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
        getValue();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<div class="replacer">
    NumberReplacer
    <input bind:value={value} bind:this={inputElement} onchange={onChange}/>
</div>
