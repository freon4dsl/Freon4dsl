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
				<Item on:SMUI:action={() => (handleClick(item.id))} disabled={isDisabled(item.id)}>
					<Text>{item.title}</Text>
				</Item>
				{#if item.id === 2 || item.id === 5 || item.id === 6 }
					<Separator />
				{/if}
			{/each}
		</List>
	</Menu>
</div>

<script lang="ts">
	import { isRtError, FreNode } from "@freon4dsl/core";
	import type { MenuComponentDev } from '@smui/menu';
	import Menu from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, {
		Item,
		Separator,
		Text
	} from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { editorEnvironment } from "../../config/WebappConfiguration";
	import { activeTab, interpreterTab, interpreterTrace } from "../stores/InfoPanelStore";
	import { MenuItem } from "../ts-utils/MenuItem";
	import {
		findNamedDialogVisible,
		findStructureDialogVisible,
		findTextDialogVisible
	} from "../stores/DialogStore";
	import { EditorRequestsHandler } from "../../language/EditorRequestsHandler";
	import { setUserMessage } from "../stores/UserMessageStore";

	let menu: MenuComponentDev;

	// stuff for positioning the menu
	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {}; // a list of name - boolean pairs

	const addClass = (className: string) => {
		if (!anchorClasses[className]) {
			anchorClasses[className] = true;
		}
	}
	const removeClass = (className: string) => {
		if (anchorClasses[className]) {
			delete anchorClasses[className];
			anchorClasses = anchorClasses;
		}
	}

	// implementation of all actions
	const findText = () => {
		$findTextDialogVisible = true;
	}

	const runInterpreter = () => {
		const intp = editorEnvironment.interpreter;
		intp.setTracing(true);
		const node: FreNode = editorEnvironment.editor.selectedElement;

		const value = intp.evaluate(node);
		if(isRtError(value)){
			interpreterTrace.set(value.toString());
		} else {
			const trace = intp.getTrace().root.toStringRecursive();
			console.log(trace);
			interpreterTrace.set(trace);
		}
		activeTab.set(interpreterTab);
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

	const notImplemented = () => {
		setUserMessage("Sorry, this action is not yet implemented.");
	}

	// all menu items
	let menuItems : MenuItem[] = [
		{ title: 'Undo', action: EditorRequestsHandler.getInstance().undo, id: 1 },
		{ title: 'Redo', action: EditorRequestsHandler.getInstance().redo, id: 2 },
		{ title: 'Cut', action: EditorRequestsHandler.getInstance().cut, id: 3 },
		{ title: 'Copy', action: EditorRequestsHandler.getInstance().copy, id: 4 },
		{ title: 'Paste', action: EditorRequestsHandler.getInstance().paste, id: 5 },
		{ title: 'Validate', action: EditorRequestsHandler.getInstance().validate, id: 6 },
		{ title: 'Find Named Element', action: findNamedElement, id: 7 },
		{ title: 'Find Structure Element', action: findStructureElement, id: 8 },
		{ title: 'Find Text', action: findText, id: 9 },
		{ title: 'Run Interpreter', action: runInterpreter, id: 10 },
	];

	function isDisabled(id): boolean {
		if ( id === 8 ) { // find structure element
			return true;
		}
		return false;
	}
</script>
