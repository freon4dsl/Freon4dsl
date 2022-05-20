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
		<List twoLine>
			<Item on:SMUI:action={() => (clicked = 'Cut')}>
				<Text>
					<PrimaryText>Cut</PrimaryText>
					<SecondaryText>Copy to clipboard and remove.</SecondaryText>
				</Text>
			</Item>
			<Item on:SMUI:action={() => (clicked = 'Copy')}>
				<Text>
					<PrimaryText>Copy</PrimaryText>
					<SecondaryText>Copy to clipboard.</SecondaryText>
				</Text>
			</Item>
			<Item on:SMUI:action={() => (clicked = 'Paste')}>
				<Text>
					<PrimaryText>Paste</PrimaryText>
					<SecondaryText>Paste from clipboard.</SecondaryText>
				</Text>
			</Item>
			<Separator />
			<Item on:SMUI:action={() => {console.log('Validate: should load errors'); $errorsLoaded = true}}>
				<Text>
					<PrimaryText>Validate</PrimaryText>
					<SecondaryText>Validate the current model unit.</SecondaryText>
				</Text>
			</Item>
			<Separator />
			<Item on:SMUI:action={() => (clicked = 'Delete')}>
				<Text>
					<PrimaryText>Delete</PrimaryText>
					<SecondaryText>Remove item.</SecondaryText>
				</Text>
			</Item>
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
		Text,
		PrimaryText,
		SecondaryText,
	} from '@smui/list';
	import Button, { Label } from '@smui/button';
	import { errorsLoaded } from "../stores/InfoPanelStore";
	let menu: MenuComponentDev;
	let clicked = 'nothing yet';
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
</script>
