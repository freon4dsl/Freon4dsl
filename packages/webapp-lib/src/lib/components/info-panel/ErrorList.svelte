<DataTable
	sortable
	bind:sort
	bind:sortDirection
	onSMUIDataTableSorted={handleSort}
	table$aria-label="Error list"
	style="width: 100%;"
>
	<Head>
		<Row>
			<!--
				Note: whatever you supply to "columnId" is
				appended with "-status-label" and used as an ID
				for the hidden label that describes the sort
				status to screen readers.

				You can localize those labels with the
				"sortAscendingAriaLabel" and
				"sortDescendingAriaLabel" props on the DataTable.
			-->
			<Cell checkbox sortable={false}>
				<Label>Show in Editor</Label>
			</Cell>
			<Cell columnId="message" style="width: 100%;">
				<Label>Message</Label>
				<!-- For non-numeric columns, icon comes second. -->
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
			<Cell columnId="locationdescription">
				<Label>Location</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
			<Cell columnId="severity">
				<Label>Severity</Label>
				<IconButton class="material-icons">arrow_upward</IconButton>
			</Cell>
		</Row>
	</Head>
	<Body>
	{#each modelErrors.list as item, index}
		<Row >
			<Cell>
				<Radio
						bind:group={selected}
						value={index}
				/>
			</Cell>
			<Cell>{item.message}</Cell>
			<Cell>{item.locationdescription}</Cell>
			<Cell>{item.severity}</Cell>
		</Row>
	{/each}
	</Body>

	<LinearProgress
			indeterminate
			closed={errorsLoaded.value}
			aria-label="Data is being loaded..."
	/>
</DataTable>

<script lang="ts">
	import DataTable, {
		Head,
		Body,
		Row,
		Cell,
		Label
	} from '@smui/data-table';
	import type { SortValue } from '@material/data-table'; // should be exported by SMUI, but gives error
	import Radio from '@smui/radio';
	import IconButton from '@smui/icon-button';
	import LinearProgress from '@smui/linear-progress';
	import { errorsLoaded, modelErrors } from "../stores/InfoPanelStore.svelte";
	import {type FreError, isNullOrUndefined} from "@freon4dsl/core";
	import { EditorState } from "$lib/language/EditorState";

	// sorting of table
	let sort: keyof FreError = $state('message');
	let sortDirection: Lowercase<keyof typeof SortValue> = $state('ascending');

	function handleSort() {
		// first remember the currently selected item
		let item;
		if (!!modelErrors.list && modelErrors.list.length > 0) {
			item = modelErrors.list[selected];
		}
		modelErrors.list.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
				]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		modelErrors.list = modelErrors.list; // we need an assignment to trigger svelte's reactiveness
		// find the new index for the selected item and make sure this is marked
		if (!isNullOrUndefined(item)) {
			selected = modelErrors.list.indexOf(item);
			handleClick(selected);
		}
	}

	// selection of row does not function, therefore we use the checkbox option from the SMUI docs
	// todo look into selection of row in errorlist
	let selected: number = $state(0);
	$effect(() => {handleClick(selected);});

	const handleClick = (index: number) => {
		if (!!modelErrors.list && modelErrors.list.length > 0) {
			const item: FreError = modelErrors.list[index];
			// TODO declaredType should be changed to property coming from error object.
			if (Array.isArray(item.reportedOn)) {
				EditorState.getInstance().selectElement(item.reportedOn[0], item.propertyName);
			} else {
				EditorState.getInstance().selectElement(item.reportedOn, item.propertyName);
			}
		}
	}

</script>
