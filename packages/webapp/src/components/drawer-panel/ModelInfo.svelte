<div>
    <Group>
        {#each $unitTypes as name}
            <Separator/>
            <Subtitle>{name}</Subtitle>
            <List class="demo-list" dense>
                {#if !!myUnits}
                    {#each myUnits as unit, index}
                        {#if unit.piLanguageConcept() === name}
                            <div>
                                <Item activated={(unit.name === $currentUnitName)} on:SMUI:action={() => menus[index].setOpen(true)}>
                                    <Text>{unit.name}</Text>
                                </Item>
                                <Menu bind:this={menus[index]}>
                                    <List>
                                        <Item on:SMUI:action={() => (console.log('Cut'))}>
                                            <Text>Cut</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (console.log('Copy'))}>
                                            <Text>Copy</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (console.log('Paste'))}>
                                            <Text>Paste</Text>
                                        </Item>
                                        <Separator/>
                                        <Item on:SMUI:action={() => (console.log('Delete'))}>
                                            <Text>Delete</Text>
                                        </Item>
                                    </List>
                                </Menu>
                            </div>
                        {/if}
                    {/each}
                {:else}
                    <div>
                        <Item activated={false}>
                            <Text>no units available</Text>
                        </Item>
                    </div>
                {/if}
            </List>
        {/each}
        <Separator/>
    </Group>
</div>

<script lang="ts">
    import List, { Group, Item, Text, Separator } from '@smui/list';
    import { unitTypes } from "../../stores/LanguageStore";
    import { currentUnitName, units } from "../../stores/ModelStore";
    import type { MenuComponentDev } from '@smui/menu';
    import { Subtitle } from "@smui/drawer";
    import Menu from '@smui/menu';

    let activated: boolean = true;
    let menus: MenuComponentDev[] = [];

    let myUnits = [];
    $: myUnits = $units;
</script>

<style>
    * :global(.demo-list) {
        max-width: 600px;
        /* todo use color variable here */
        border-left: 1px solid darkred;
    }
</style>
