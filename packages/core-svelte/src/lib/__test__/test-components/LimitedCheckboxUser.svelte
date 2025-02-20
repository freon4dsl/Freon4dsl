<script lang="ts">
    import { SimpleElement } from '$lib/__test__/test-environment/simple-models/SimpleElement.js';
    import { LimitedElement } from '$lib/__test__/test-environment/simple-models/LimitedElement.js';
    import { LimitedControlBox } from '@freon4dsl/core';
    import LimitedCheckboxComponent from '$lib/components/LimitedCheckboxComponent.svelte';
    import type { MainComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';

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
    let limVar1: LimitedElement[] = $state([LimitedElement.TuesdayAfternoon]);
    const getValues = () => {
        return limVar1.map((v) => v.name);
    };
    const setValues = (selected: string[]) => {
        limVar1 = [];
        selected.forEach((xx) => {
            switch (xx) {
                case 'MondayMorning':
                    limVar1.push(LimitedElement.MondayMorning);
                    break;
                case 'MondayAfternoon':
                    limVar1.push(LimitedElement.MondayAfternoon);
                    break;
                case 'TuesdayMorning':
                    limVar1.push(LimitedElement.TuesdayMorning);
                    break;
                case 'TuesdayAfternoon':
                    limVar1.push(LimitedElement.TuesdayAfternoon);
                    break;
                case 'WednesdayMorning':
                    limVar1.push(LimitedElement.WednesdayMorning);
                    break;
                case 'WednesdayAfternoon':
                    limVar1.push(LimitedElement.WednesdayAfternoon);
                    break;
                case 'ThursdayMorning':
                    limVar1.push(LimitedElement.ThursdayMorning);
                    break;
                case 'ThursdayAfternoon':
                    limVar1.push(LimitedElement.ThursdayAfternoon);
                    break;
                case 'FridayMorning':
                    limVar1.push(LimitedElement.FridayMorning);
                    break;
                case 'FridayAfternoon':
                    limVar1.push(LimitedElement.FridayAfternoon);
                    break;
                default:
                    limVar1.push(LimitedElement.FridayAfternoon);
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

<LimitedCheckboxComponent {editor} box={limitedBox1} /> current value:
{#each limVar1 as v}
    <p>{v.name},</p>
{/each}
