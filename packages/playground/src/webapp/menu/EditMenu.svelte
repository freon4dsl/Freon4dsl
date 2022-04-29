<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import arrowDropDown from '../assets/icons/svg/arrow_drop_down.svg';
    import type {MenuItem} from "../webapp-ts-utils/MenuUtils";
    import {EditorCommunication} from "../editor/EditorCommunication";
    import {
        findStructureDialogVisible,
        findTextDialogVisible,
        findNamedDialogVisible,
        leftPanelVisible
    } from "../webapp-ts-utils/WebappStore";
    import { menuStyle, menuItemStyle } from "./StyleConstants";

    const findText = () => {
        $findTextDialogVisible = true;
    }

    const findStructureElement = () => {
        $findStructureDialogVisible = true;
    }

    const findNamedElement = () => {
        $findNamedDialogVisible = true;
    }

    let activatorTitle: string= "Edit";
    let menuItems : MenuItem[] = [
        { title: 'Undo', action: EditorCommunication.getInstance().undo, id: 1 },
        { title: 'Redo', action: EditorCommunication.getInstance().redo, id: 2 },
        { title: 'Validate', action: EditorCommunication.getInstance().validate, id: 3 },
        { title: 'Find Named Element', action: findNamedElement, id: 4 },
        { title: 'Find Structure Element', action: findStructureElement, id: 5 },
        { title: 'Find Text', action: findText, id: 6 },
        { title: 'Replace', action: EditorCommunication.getInstance().replace, id: 7 },
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

<Menu style={menuStyle} origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="Edit menu">{activatorTitle} <Icon> <svelte:component this={arrowDropDown}/> </Icon></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style={menuItemStyle} disabled={item.id > 2 && item.id < 7 ? false : true}
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
        color: var(--theme-colors-color);
        background-color: var(--theme-colors-inverse_color);
    }
</style>
