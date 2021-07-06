<script lang="ts">
    import { Button, Menu, Menuitem} from 'svelte-mui';
    import {MenuItem} from "../menu-ts-files/MenuItem";
    import {EditorCommunication} from "../editor/EditorCommunication";

    const myAction = (id: number) => {console.log("Edit menu " + id + " action performed");};

    let activatorTitle: string= "Edit";
    let menuItems : MenuItem[] = [
        { title: 'Undo', action: EditorCommunication.getInstance().undo, id: 1 },
        { title: 'Redo', action: EditorCommunication.getInstance().redo, id: 2 },
        { title: 'Find Text', action: EditorCommunication.getInstance().findText, id: 3 },
        { title: 'Find Element', action: EditorCommunication.getInstance().findElement, id: 4 },
        { title: 'Replace', action: EditorCommunication.getInstance().replace, id: 5 },
    ];

    export let props;

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
    };
</script>

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
                height: 28px;" disabled={true}
                      on:click={() => handleClick(item.id)}>
                {item.title}
            </Menuitem>
        {:else}
            <p>There are no items to show...</p>
        {/each}
</Menu>
