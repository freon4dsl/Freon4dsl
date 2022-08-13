<script>
import Menu from './Menu.svelte';
import MenuOption from './MenuOption.svelte';

export let currentElement = { name: "?", isRed: false, showMenu: false }
export let allElements

let pos = { x: 0, y: 0 };

async function onRightClick(e) {
	// first close all "open" menu's in all steps
	for (let i = 0; i < allElements.length; i++) {
    allElements[i].showMenu = false;
	}
	// now open the menu at the right place
	pos = { x: e.clientX, y: e.clientY };
	currentElement.showMenu = true;
	console.log("pos:", pos)
}

function closeMenu() {
	currentElement.showMenu = false;
}

function makeRedBefore() {
	let isRed = true
	for (let i = 0; i < allElements.length; i++) {
		if (allElements[i] === currentElement) {
			isRed = false
		}
		allElements[i].isRed = isRed
	}
}

function makeRedAfter() {
	let isRed = false
	for (let i = 0; i < allElements.length; i++) {
		allElements[i].isRed = isRed
		if (allElements[i] === currentElement) {
			isRed = true
		}
	}
}

function noRed() {
	for (let i = 0; i < allElements.length; i++) {
		allElements[i].isRed = false
	}
}

function allRed() {
	for (let i = 0; i < allElements.length; i++) {
		allElements[i].isRed = true
	}
}

</script>

<div on:contextmenu|preventDefault="{onRightClick}" class:red={currentElement.isRed}>{currentElement.name}</div>

{#if currentElement.showMenu}
	<Menu {...pos} on:click={closeMenu} on:clickoutside={closeMenu}>
		<MenuOption
			on:click={makeRedBefore}
			text="Make red before element [{currentElement.name}]" />
		<MenuOption
			on:click={makeRedAfter}
			text="Make red after element [{currentElement.name}]" />
		<MenuOption
			on:click={noRed}
			text="Remove red" />
		<MenuOption
			on:click={allRed}
			text="Make all red" />
	</Menu>
{/if}

<style>
	.red {
		color: red;
	}
</style>
