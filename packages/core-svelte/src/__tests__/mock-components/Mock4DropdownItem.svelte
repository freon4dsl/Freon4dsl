<script lang="ts">
    import { SelectOption } from "@projectit/core";
    import DropdownItemComponent from "../../components/DropdownItemComponent.svelte";
    import { MockVariables } from "./MockVariables";

    // Parameters
    export let isSelected: boolean;
    export let option: SelectOption = { id: "select-text", label: "select-text" };
    export let id = "test-dropdownItem";

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        console.log("YESSSSSSSSSSSS");
        MockVariables.pi_itemSelected(event);
    };

</script>

<div on:pi-ItemSelected={onSelectOption}
     id="{id}"
>
    <DropdownItemComponent option={option} isSelected={isSelected}/>
</div>
