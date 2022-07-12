<script lang="ts">
    import DropdownItemComponent from "../../components/DropdownItemComponent.svelte";
    import { SelectOption } from "@projectit/core";
    import { MockVariables } from "../mock-components/MockVariables";

    export let option: SelectOption = { id: "1", label: "select-text" };

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        // console.log("Mock4DropdownItemComponent received option " + JSON.stringify(event.detail));
        MockVariables.pi_itemSelected(event);
    };
</script>

<div id="parent">
    <DropdownItemComponent on:piItemSelected={onSelectOption} option={option} />
</div>
