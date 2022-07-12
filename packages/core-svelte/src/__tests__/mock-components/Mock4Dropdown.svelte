<script lang="ts">
    import DropdownComponent from "../../components/DropdownComponent.svelte";

    import { SelectOption } from "@projectit/core";
    import { MockVariables } from "../mock-components/MockVariables";
    import { dropdownOpen, selectedOptionId } from "../../components/DropdownStore";
    import { testOptions } from "./options";

    export let id: string = "mock-dropdown";
    export let optionId: string = "1";
    export let openDropdown: boolean = true;
    $selectedOptionId = optionId;
    $dropdownOpen = openDropdown;

    const getOptions = (): SelectOption[] => {
        return testOptions;
    };

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        // console.log("Mock4DropdownComponent received option " + JSON.stringify(event.detail));
        MockVariables.pi_itemSelected(event);
    };
</script>

<div id="{id}">
    {#if $dropdownOpen}
        <DropdownComponent on:piItemSelected={onSelectOption}
                           getOptions={getOptions}
        />
    {/if}
</div>
