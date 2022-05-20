<div
        class={Object.keys(anchorClasses).join(' ')}
        use:Anchor={{addClass: addClass, removeClass: removeClass}}
        bind:this={anchor}
>
    <Button variant="raised" on:click={() => menu.setOpen(true)}>
        <Label>View</Label>
    </Button>
    <Menu bind:this={menu}
          anchor={false}
          bind:anchorElement={anchor}
          anchorCorner="BOTTOM_LEFT"
    >
        <List>
            {#each options as option}
                <SelectionGroup>
                        <Item
                                on:SMUI:action={() => {if (option.name !== 'default') {option.selected = !option.selected;}  }}
                                bind:selected={option.selected}
                        >
                            <SelectionGroupIcon>
                                <i class="material-icons">check</i>
                            </SelectionGroupIcon>
                            <Text>{option.name}</Text>
                        </Item>
                </SelectionGroup>
            {/each}
            <Item on:SMUI:action={apply}>
                <Text>Apply</Text>
            </Item>
        </List>
    </Menu>
</div>


<script lang="ts">
    import Button, { Label } from '@smui/button';
    import type { MenuComponentDev } from '@smui/menu';
    import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
    import List, { Item, Separator, Text } from '@smui/list';
    import { projectionNames } from "../stores/LanguageStore";
    import { Anchor } from '@smui/menu-surface';

    let menu: MenuComponentDev;
    // following is used to position the menu
    let anchor: HTMLDivElement;
    let anchorClasses: { [k: string]: boolean } = {};

    const addClass = (className) => {
        if (!anchorClasses[className]) {
            anchorClasses[className] = true;
        }
    }
    const removeClass = (className) => {
        if (anchorClasses[className]) {
            delete anchorClasses[className];
            anchorClasses = anchorClasses;
        }
    }

    let options = [];
    for (const view of $projectionNames) {
        let selected: boolean = false;
        if (view === 'default') {
            selected = true;
        }
        // todo selected should be stored and retrieved for each name
        options.push({name: view, selected: selected})
    }

    function apply() {
        console.log(options.map(opt => opt.selected ? opt.name : null).join(", "));
    }
</script>
