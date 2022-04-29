<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style={dialogStyle}
		bind:visible={$newUnitDialogVisible}
		on:keydown={handleKeydown}>
	<div slot="title" class="title">New unit</div>

	<Textfield
			name="unitname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
			style="--label: var(--theme-colors-divider); --color: var(--theme-colors-color)"
			placeholder="unit name"
	/>

	{#each get(unitTypes) as name}
		<Radio {...props} bind:group={group} value={name}>
			<span class="item-name">{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Please enter the name of the new unit.
	</div>

</Dialog>


<script lang="ts">
	import { Button, Dialog, Radio, Textfield } from 'svelte-mui';
	import { unitNames, unitTypes } from "../../webapp-ts-utils/WebappStore";
	import { get } from 'svelte/store';
	import { EditorCommunication } from "../../editor/EditorCommunication";
	import { newUnitDialogVisible } from "../../webapp-ts-utils/WebappStore";
	import { dialogStyle } from "../StyleConstants";

	// all unit names in a model must be unique
	let newName: string = "";

	// take care of the type of unit to be created
	let group: string = $unitTypes[0]; // initialize to the first

	// if something is wrong show this message
	let localErrorMessage: string = "";

	// props for all of the radio buttons
	let props = {
		right: false,
		ripple: true,
		disabled: false,
		color: "var(--theme-colors-color)"
	};

	const handleCancel = () => {
		// console.log("Cancel called");
		$newUnitDialogVisible = false;
		newName = "";
		localErrorMessage = "";
		group = $unitTypes[0];
	}

	const handleSubmit = () => {
		// console.log("NewModel.Submit called");
		if ($unitNames.includes(newName)) {
			localErrorMessage = "Unit with this name already exists";
		} else if (newName.match(/^[0-9]/)) {
			localErrorMessage = "Name must start with a character.";
		} else if (!newName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			localErrorMessage = "Only characters and numbers allowed.";
		} else {
			if (newName?.length > 0) {
				EditorCommunication.getInstance().newUnit(newName, group);
			}
			newName = "";
			$newUnitDialogVisible = false;
		}
	}

	const handleKeydown = (event) => {
		if ($newUnitDialogVisible) {
			switch (event.keyCode) {
				case 13: { // Enter key
					event.stopPropagation();
					event.preventDefault();
					handleSubmit();
					break;
				}
			}
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--theme-colors-color);
	}
	.actions {
		float: right;
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
	.item-name {
		color: var(--theme-colors-color);
	}
</style>
