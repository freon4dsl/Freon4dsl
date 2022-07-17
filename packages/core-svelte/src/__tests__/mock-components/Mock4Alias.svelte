<script lang="ts">
    import { SelectOption } from "@projectit/core";
    import { MockVariables } from "../mock-components/MockVariables";
    import { dropdownOpen, selectedOptionId } from "../../components/DropdownStore";
    import { testOptions } from "./options";
    import SelectableComponent from "../../components/SelectableComponent.svelte";
    import AliasComponent from "../../components/AliasComponent.svelte";

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
    <SelectableComponent box={showBox} editor={editor}>
        <AliasComponent choiceBox={showBox} editor={editor}/>
    </SelectableComponent>
</div>
