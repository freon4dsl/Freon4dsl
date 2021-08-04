<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import { arrowDropDown } from '../assets/icons';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import {EditorCommunication} from "../editor/EditorCommunication";
    import { leftPanelVisible } from "../WebappStore";

    let activatorTitle: string= "Edit";
    let menuItems : MenuItem[] = [
        { title: 'Undo', action: EditorCommunication.getInstance().undo, id: 1 },
        { title: 'Redo', action: EditorCommunication.getInstance().redo, id: 2 },
        { title: 'Validate', action: EditorCommunication.getInstance().validate, id: 3 },
        { title: 'Find Text', action: EditorCommunication.getInstance().findText, id: 4 },
        { title: 'Find Element', action: EditorCommunication.getInstance().findElement, id: 5 },
        { title: 'Replace', action: EditorCommunication.getInstance().replace, id: 6 },
    ];

    export let props;

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
        $leftPanelVisible = false;
    };
</script>

<Menu style="border-radius: 2px; background-color: var(--inverse-color)" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="Edit menu">{activatorTitle} <Icon path={arrowDropDown}/></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style="font-size: var(--menuitem-font-size);
                margin: 4px 10px;
                padding: 2px;
                height: 28px;" disabled={true}
                      on:click={() => handleClick(item.id)}>
                {item.title}
            </Menuitem>
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
