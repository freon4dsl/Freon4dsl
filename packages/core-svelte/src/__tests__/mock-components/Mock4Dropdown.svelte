<script lang="ts">
    import DropdownComponent from "../../components/DropdownComponent.svelte";

    import { SelectOption } from "@projectit/core";
    import { MockVariables } from "../mock-components/MockVariables";
    import { selectedOptionId } from "../../components/DropdownStore";
    import { testOptions } from "./options";

    export let id: string = "mock-dropdown";
    export let optionId: string = '1';
    $selectedOptionId = optionId;

    const getOptions = (): SelectOption[] => {
        // console.log("IN MOCK: " + testOptions.map(opt => opt.id));
        return testOptions;
    };

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        console.log("Mock4DropdownComponent received option " + JSON.stringify(event.detail));
        MockVariables.pi_itemSelected(event);
    };
</script>

<div id="{id}">
    <DropdownComponent on:piItemSelected={onSelectOption}
                       getOptions={getOptions}
    />
</div>
