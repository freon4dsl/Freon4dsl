
<!-- todo when a checkbox is activated, the menu is not closed -->
<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import { arrowDropDown } from '../assets/icons';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import {EditorCommunication} from "../editor/EditorCommunication";
    import { leftPanelVisible } from "../store";

    const myAction = (id: number) => {console.log("Projection menu " + id + " action performed");};
    let activatorTitle: string= "Projection";
    let menuItems : MenuItem[] = [];

    export let props;

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        if (checked[id]) {
            EditorCommunication.getInstance().unsetProjection(menuItem.title);
        } else {
            EditorCommunication.getInstance().setProjection(menuItem.title);
        }
        $leftPanelVisible = false;
    };

    // extra for checkboxes
    import { Checkbox } from 'svelte-mui';
    let checked: boolean[] = [];
    let props2 = {
        color: 'accent',
        name: 'svelte',
        value: 'awesome',
    };
    //
    EditorCommunication.getInstance().getProjectionNames().map((name, index) => {
        menuItems.push ({ title: name, action: myAction, id: index });
        if (index === 0) {
            checked.push(true);
        } else {
            checked.push(false);
        }
    });
</script>

<Menu style="border-radius: 2px; background-color: var(--inverse-color)" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="Projection menu">{activatorTitle} <Icon path={arrowDropDown}/></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            {#if item.id === 0}
                <!-- style needs to be added here, not as class -->
                <Menuitem style="font-size: var(--menuitem-font-size);
                        margin: 4px 10px;
                        padding: 2px;
                        height: 28px;"
                          on:click={() => handleClick(item.id)}>
                    <Checkbox {...props2} bind:checked={checked[item.id]} disabled={true}>
                        {item.title}
                    </Checkbox>
                </Menuitem>
            {:else}
                <Menuitem style="font-size: var(--menuitem-font-size);
                        margin: 4px 10px;
                        padding: 2px;
                        height: 28px;"
                          on:click={() => handleClick(item.id)}>
                    <Checkbox {...props2} bind:checked={checked[item.id]} disabled={false}>
                        {item.title}
                    </Checkbox>
                </Menuitem>
            {/if}
        {:else}
            <p>There are no items to show...</p>
        {/each}
    </div>
</Menu>

<style>
    .menu-list {
        background-color: var(--inverse-color);
    }
</style>
