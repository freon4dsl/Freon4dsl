<div
		class={Object.keys(anchorClasses).join(' ')}
		use:Anchor={{addClass: addClass, removeClass: removeClass}}
		bind:this={anchor}
>
	<Button variant="raised" on:click={() => menu.setOpen(true)}>
		<Label>Edit</Label>
	</Button>
	<Menu
			bind:this={menu}
			anchor={false}
			bind:anchorElement={anchor}
			anchorCorner="BOTTOM_LEFT"
	>
		<List>
			{#each menuItems as item (item.id)}
				<Item on:SMUI:action={() => (handleClick(item.id))}>
					<Text>{item.title}</Text>
				</Item>
				{#if item.id === 2 || item.id === 3}
					<Separator />
				{/if}
			{/each}
		</List>
	</Menu>
</div>

<script lang="ts">
	import type { MenuComponentDev } from '@smui/menu';
	import Menu from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, {
		Item,
		Separator,
		Text
	} from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { MenuItem } from "../ts-utils/MenuUtils";
	import { EditorCommunication } from "../../language/EditorCommunication";
	import {
		findNamedDialogVisible,
		findStructureDialogVisible,
		findTextDialogVisible
	} from "../stores/DialogStore";

	let menu: MenuComponentDev;
	let clicked = 'nothing yet';

	// stuff for posiitoning the menu
	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {}; // a list of name - boolean pairs

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

	// implementation of all actions
	const findText = () => {
		$findTextDialogVisible = true;
		console.log("EditMenu.findText: " + $findTextDialogVisible);
	}

	const findStructureElement = () => {
		$findStructureDialogVisible = true;
	}

	const findNamedElement = () => {
		$findNamedDialogVisible = true;
	}

	// when a menu-item is clicked, this function is executed
	const handleClick = (id: number) => {
		// find the item that was clicked
		let menuItem = menuItems.find(item => item.id === id);
		// perform the action associated with the menu item
		menuItem.action(id);
	};

	// all menu items
	let menuItems : MenuItem[] = [
		{ title: 'Undo', action: EditorCommunication.getInstance().undo, id: 1 },
		{ title: 'Redo', action: EditorCommunication.getInstance().redo, id: 2 },
		{ title: 'Validate', action: EditorCommunication.getInstance().validate, id: 3 },
		{ title: 'Find Named Element', action: findNamedElement, id: 4 },
		{ title: 'Find Structure Element', action: findStructureElement, id: 5 },
		{ title: 'Find Text', action: findText, id: 6 },
		{ title: 'Replace', action: EditorCommunication.getInstance().replace, id: 7 },
	];
</script>
