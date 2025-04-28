<script lang="ts">
    import { SimpleElement } from '$lib/__test__/test-environment/simple-models/SimpleElement.js';
    import { LimitedElement } from '$lib/__test__/test-environment/simple-models/LimitedElement.js';
    import { LimitedControlBox } from '@freon4dsl/core';
    import type { MainComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import LimitedRadioComponent from '$lib/components/LimitedRadioComponent.svelte';

    // Props
    let { editor }: MainComponentProps = $props();

    let limElement = new SimpleElement('id99');
    let allValues = [
        LimitedElement.MondayMorning.name,
        LimitedElement.MondayAfternoon.name,
        LimitedElement.TuesdayMorning.name,
        LimitedElement.TuesdayAfternoon.name,
        LimitedElement.WednesdayMorning.name,
        LimitedElement.WednesdayAfternoon.name,
        LimitedElement.ThursdayMorning.name,
        LimitedElement.ThursdayAfternoon.name,
        LimitedElement.FridayMorning.name,
        LimitedElement.FridayAfternoon.name
    ];
    let limVar1: LimitedElement = $state(LimitedElement.MondayMorning);
    const getValues = () => {
        return [limVar1.name];
    };
    const setValues = (selected: string[]) => {
        selected.forEach((xx) => {
            switch (xx) {
                case 'MondayMorning':
                    limVar1 = LimitedElement.MondayMorning;
                    break;
                case 'MondayAfternoon':
                    limVar1 = LimitedElement.MondayAfternoon;
                    break;
                case 'TuesdayMorning':
                    limVar1 = LimitedElement.TuesdayMorning;
                    break;
                case 'TuesdayAfternoon':
                    limVar1 = LimitedElement.TuesdayAfternoon;
                    break;
                case 'WednesdayMorning':
                    limVar1 = LimitedElement.WednesdayMorning;
                    break;
                case 'WednesdayAfternoon':
                    limVar1 = LimitedElement.WednesdayAfternoon;
                    break;
                case 'ThursdayMorning':
                    limVar1 = LimitedElement.ThursdayMorning;
                    break;
                case 'ThursdayAfternoon':
                    limVar1 = LimitedElement.ThursdayAfternoon;
                    break;
                case 'FridayMorning':
                    limVar1 = LimitedElement.FridayMorning;
                    break;
                case 'FridayAfternoon':
                    limVar1 = LimitedElement.FridayAfternoon;
                    break;
                default:
                    limVar1 = LimitedElement.FridayAfternoon;
                    break;
            }
        });
    };
    let limitedBox1: LimitedControlBox = new LimitedControlBox(
        limElement,
        'limited checkbox',
        getValues,
        setValues,
        allValues
    );
</script>

<LimitedRadioComponent {editor} box={limitedBox1} />
current value: {limVar1.name}
