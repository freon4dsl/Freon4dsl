<script lang="ts">
    import {Button, Menu, Menuitem} from 'svelte-mui';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import Keybindings from "./Keybindings.svelte";
    import AboutDialog from "./AboutDialog.svelte";
    import HelpDialog from "./HelpDialog.svelte";

    const myAction = (id: number) => {
        console.log("Help menu " + id + " action performed");
    };

    let activatorTitle: string = "Help";
    let menuItems: MenuItem[] = [
        {title: 'Help', action: myAction, id: 1},
        {title: 'Keybindings', action: null, id: 2},
        {title: 'About', action: null, id: 3},
    ];

    export let props;

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        if (id === 2) {
            keybindingsDialogVisible = true;
        } else if (id === 3) {
            aboutDialogVisible = true;
        } else if (id === 1) {
            helpDialogVisible = true;
        } else {
            menuItem.action(id);
        }
    };

    let helpDialogVisible: boolean = false;
    let aboutDialogVisible: boolean = false;
    let keybindingsDialogVisible: boolean = false;
</script>

<HelpDialog bind:visible={helpDialogVisible}/>
<AboutDialog bind:visible={aboutDialogVisible}/>
<Keybindings bind:visible={keybindingsDialogVisible}/>

<Menu style="border-radius: 2px;" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="File menu">{activatorTitle}</Button>
		</span>
        <!--  here the list of menu options should be placed -->
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style="font-size: var(--menuitem-font-size);
                margin: 4px 10px;
                padding: 2px;
                height: 28px;"
                      on:click={() => handleClick(item.id)}>
                {item.title}
            </Menuitem>
        {:else}
            <p>There are no items to show...</p>
        {/each}
</Menu>
