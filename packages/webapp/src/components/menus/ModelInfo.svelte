<div>
    <Group>
        {#each $unitTypes as name}
            <Separator/>
            <Subtitle>{name}</Subtitle>
            <List class="demo-list" dense>
                {#each myUnitInfo as unit}
                    {#if unit.type === name}
                        <div>
                            <Item activated={unit.isOpen} on:SMUI:action={() => xxx(unit)}>
                                <Text>{unit.name}</Text>
                            </Item>
                        </div>
                    {/if}
                {/each}
            </List>
        {/each}
        <Separator/>
    </Group>
    <Menu bind:this={menu}>
        <List>
            <Item on:SMUI:action={() => (setClicked('Cut'))}>
                <Text>Cut</Text>
            </Item>
            <Item on:SMUI:action={() => (setClicked('Copy'))}>
                <Text>Copy</Text>
            </Item>
            <Item on:SMUI:action={() => (setClicked('Paste'))}>
                <Text>Paste</Text>
            </Item>
            <Separator/>
            <Item on:SMUI:action={() => (setClicked('Delete'))}>
                <Text>Delete</Text>
            </Item>
        </List>
    </Menu>
</div>

<script lang="ts">
    import List, { Group, Item, Text, Separator } from '@smui/list';
    import { unitTypes } from "../../stores/LanguageStore";
    import { currentUnitName, units } from "../../stores/ModelStore";
    import type { MenuComponentDev } from '@smui/menu';
    import { Subtitle } from "@smui/drawer";
    import Menu from '@smui/menu';
    // import { Anchor } from '@smui/menu-surface';

    let activated: boolean = true;
    let menu: MenuComponentDev;
    // let anchor: HTMLDivElement;
    // let anchorClasses: { [k: string]: boolean } = {}; // a list of name - boolean pairs
    //
    // const addClass = (className) => {
    //     if (!anchorClasses[className]) {
    //         anchorClasses[className] = true;
    //     }
    // }
    // const removeClass = (className) => {
    //     if (anchorClasses[className]) {
    //         delete anchorClasses[className];
    //         anchorClasses = anchorClasses;
    //     }
    // }

    function setClicked(val: string) {
        // clicked = val;
        console.log("Menu item '" + val + "' clicked")
    }
    class UnitInfo {
        index: number;      // the index in $units
        type: string;       // the type of the unit, i.e. the metatype of the unit
        name: string;       // name of the unit
        isOpen: boolean;    // is this unit open in the editor
        anchor: HTMLDivElement; // is used to position the submenu
    }
    // initialize myUnits to something that will not break the app
    // let myUnits: Array<PiModelUnit[]> = [];
    let myUnitInfo: UnitInfo[] = [];
    // set myUnits when model units are found
    $: if ($units) {
        // there are units, so fill the local data structure
        $units.forEach(unit => {
            let yy = new UnitInfo();
            yy.name = unit.name;
            yy.type = unit.piLanguageConcept();
            yy.isOpen = (unit.name === $currentUnitName);
            myUnitInfo.push(yy);
        });
    } else {
        // no units, so set the local data structure to empty
        $unitTypes.forEach((name, index) => {
            let yy = new UnitInfo();
            yy.name = '<no units available>';
            yy.type = name;
            yy.isOpen = false;
            myUnitInfo.push(yy);
        })
    }

    const xxx = (unit: UnitInfo) => {
        // todo open context menu
        // anchor = unit.anchor;
        // menu.setOpen(true);
    }
</script>

<style>
    * :global(.demo-list) {
        max-width: 600px;
        /* todo use color variable here */
        border-left: 1px solid darkred;
    }
</style>
