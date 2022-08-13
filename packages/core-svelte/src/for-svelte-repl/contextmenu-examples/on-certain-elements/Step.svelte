<script>
import Menu from './Menu.svelte';
import MenuOption from './MenuOption.svelte';

export let step = { name: "?", isRed: false, showMenu: false }
export let steps

let pos = { x: 0, y: 0 };

async function onRightClick(e) {
	// first close all "open" menu's in all steps
	for (i = 0; i < steps.length; i++) {
    steps[i].showMenu = false;
	}
	//if (step.showMenu) {
	//		step.showMenu = false;
	//		//await new Promise(res => setTimeout(res, 100));
	//}

	pos = { x: e.clientX, y: e.clientY };
	step.showMenu = true;
	console.log("pos:", pos)
}

function closeMenu() {
		step.showMenu = false;
}

function makeRedBefore() {
	let isRed = true
	for (i = 0; i < steps.length; i++) {
		if (steps[i] === step) {
			isRed = false
		}
		steps[i].isRed = isRed
	}
}

function makeRedAfter() {
	let isRed = false
	for (i = 0; i < steps.length; i++) {
		steps[i].isRed = isRed
		if (steps[i] === step) {
			isRed = true
		}
	}
}

function noRed() {
	for (i = 0; i < steps.length; i++) {
		steps[i].isRed = false
	}
}

function allRed() {
	for (i = 0; i < steps.length; i++) {
		steps[i].isRed = true
	}
}

</script>

<li on:contextmenu|preventDefault="{onRightClick}" class:red={step.isRed}>{step.name}</li>

{#if step.showMenu}
	<Menu {...pos} on:click={closeMenu} on:clickoutside={closeMenu}>
		<MenuOption
			on:click={makeRedBefore}
			text="Make red before step [{step.name}]" />
		<MenuOption
			on:click={makeRedAfter}
			text="Make red after step [{step.name}]" />
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
