<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import arrowDropDown from '../assets/icons/svg/arrow_drop_down.svg';
    import type {MenuItem} from "../webapp-ts-utils/MenuUtils";
    import {EditorCommunication} from "../editor/EditorCommunication";
    import { leftPanelVisible, projectionNames } from "../webapp-ts-utils/WebappStore";
    import { menuStyle, menuItemStyle } from "./StyleConstants";

    const myAction = (id: number) => {console.log("Projection menu " + id + " action performed");};
    let activatorTitle: string= "Projection";
    let menuItems : MenuItem[] = [];

    export let props;

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        if (id == 0) {
            // do nothing, not possible to switch off default projection
        } else {
            // perform the action associated with the menu item
            if (checked[id]) {
                EditorCommunication.getInstance().disableProjection(menuItem.title);
            } else {
                EditorCommunication.getInstance().enableProjection(menuItem.title);
            }
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
    $projectionNames.map((name, index) => {
        menuItems.push ({ title: name, action: myAction, id: index });
        checked.push(true);
    });
</script>

<Menu style="{menuStyle}" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="Projection menu">{activatorTitle} <Icon> <svelte:component this={arrowDropDown}/> </Icon></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            {#if item.id === 0}
                <!-- style needs to be added here, not as class -->
                <Menuitem style={menuItemStyle}
                          on:click={() => handleClick(item.id)}>
                    <Checkbox {...props2} bind:checked={checked[item.id]} disabled={true}>
                        {item.title}
                    </Checkbox>
                </Menuitem>
            {:else}
                <Menuitem style={menuItemStyle}
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
        color: var(--theme-colors-color);
        background-color: var(--theme-colors-inverse_color);
    }
</style>
