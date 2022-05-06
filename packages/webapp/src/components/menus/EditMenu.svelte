<div style="min-width: 50px;">
	<Button on:click={() => menu.setOpen(true)}>
		<Label>Edit</Label>
	</Button>
	<Menu bind:this={menu}>
		<List>
			<Item on:SMUI:action={() => (setClicked('Cut'))}>
				<Text>Cut</Text>
			</Item>
			<Item on:SMUI:action={() => (setClicked('Copy'))}>
				<Text>Copy</Text>
			</Item>
			<Item on:SMUI:action={() => (setClicked('Paste'))}>
				<Text>Paste</Text>
			</Item>
			<Separator />
			<Item on:SMUI:action={() => (setClicked('Delete'))}>
				<Text>Delete</Text>
			</Item>
		</List>
	</Menu>
</div>

<script lang="ts">
	import type { MenuComponentDev } from '@smui/menu';
	import Menu from '@smui/menu';
	import List, { Item, Separator, Text } from '@smui/list';
	import Button, { Label } from '@smui/button';

	let menu: MenuComponentDev;
	let clicked = 'nothing yet';

	function setClicked(val: string) {
		clicked = val;
		console.log("Menu item '" + val + "' clicked")
	}
</script>
