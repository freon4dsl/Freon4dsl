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
            <SelectionGroup>
                <Item selected={true}>
                    <SelectionGroupIcon>
                        <i class="material-icons">check</i>
                    </SelectionGroupIcon>
                    <Text>default</Text>
                </Item>
            </SelectionGroup>
            <Separator />
            {#each allProjections as option}
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
            <Separator />
            <Item on:SMUI:action={apply}>
                <Text style="color:var(--mdc-theme-primary)">Apply changes</Text>
            </Item>
        </List>
    </Menu>
</div>


<script lang="ts">
    import Button, { Label } from "@smui/button";
    import type { MenuComponentDev } from "@smui/menu";
    import Menu, { SelectionGroup, SelectionGroupIcon } from "@smui/menu";
    import List, { Item, Separator, Text } from "@smui/list";
    import { projectionNames, projectionsShown } from "../stores/LanguageStore";
    import { Anchor } from "@smui/menu-surface";
    import { EditorRequestsHandler } from "../../language/EditorRequestsHandler";

    let menu: MenuComponentDev;
    // following is used to position the menu
    let anchor: HTMLDivElement;
    let anchorClasses: { [k: string]: boolean } = {};

    const addClass = (className: string) => {
        if (!anchorClasses[className]) {
            anchorClasses[className] = true;
        }
    };
    const removeClass = (className: string) => {
        if (anchorClasses[className]) {
            delete anchorClasses[className];
            anchorClasses = anchorClasses;
        }
    };

    let allProjections = [];
    for (const view of $projectionNames) {
        let selected: boolean = false;
        if (view !== 'default') {
            if ($projectionsShown.includes(view)) {
                selected = true;
            }
            allProjections.push({ name: view, selected: selected });
        }
    }

    function apply() {
        // store the selection and enable/disable the projection
        const selection: string [] = [];
        allProjections.forEach(proj => {
            if (proj.selected) {
                selection.push(proj.name);
            }
        });
        EditorRequestsHandler.getInstance().enableProjections(selection);
        $projectionsShown = selection;
    }
</script>
