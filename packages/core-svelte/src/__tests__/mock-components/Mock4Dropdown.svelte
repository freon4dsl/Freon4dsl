<script lang="ts">
    import DropdownComponent from "../../components/DropdownComponent.svelte";
    import { SelectOption } from "@projectit/core";
    import { MockVariables } from "./MockVariables";

    export let id: string = "mock-dropdown";

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        console.log("YESSSSSSSSSSSS");
        MockVariables.pi_itemSelected(event);
    };

    const getAliasOptions = (): SelectOption[] => {
        const result: SelectOption[] = [];
        for (let counter: number = 1; counter < 10; counter++) {
            result.push({ id: "select-text" + counter, label: "select-text" + counter });
        }
        return result;
    };
</script>

<div
        id="{id}"
>
    <DropdownComponent
            on:pi-ItemSelected={onSelectOption}
            getOptions={getAliasOptions}
            selectedOptionId="2"
    />

</div>
