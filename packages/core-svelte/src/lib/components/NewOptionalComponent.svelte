<script lang="ts">
    // Props
    import { componentId, type FreComponentProps, RenderComponent } from "$lib"
	import {
		type Box,
		notNullOrUndefined,
		type NewOptionalBox,
		type SelectOption,
		isNullOrUndefined, ARROW_DOWN, ARROW_UP, ENTER
	} from "@freon4dsl/core"
	import DropdownComponent from './DropdownComponent.svelte';
	import { tick } from "svelte"

    let { editor, box }: FreComponentProps<NewOptionalBox> = $props();

    let id: string = $state(''); // an id for the html element showing the optional
    id = notNullOrUndefined(box) ? componentId(box) : 'optional-for-unknown-box';
    let isEmpty: boolean = $state(true);
	let placeholder: string = $state('add optional element');
    let contentBox: Box = $state()!;
    let contentComponent: RenderComponent | undefined = $state();
    let addButtonComponent: HTMLButtonElement | undefined = $state();
	let addButtonTitle: string = '+';
	let removeButtonTitle: string = 'X';
	let dropdownShown: boolean = $state(false);
	let selectedOption: SelectOption | undefined = $state(undefined); // the selected option in the dropdown
	let filteredOptions: SelectOption[] = $state([]); // the list of filtered options that are shown in the dropdown
	let dropdownCmp: DropdownComponent | undefined = $state(undefined);
	const noOptionsId = 'noOptions'; // constant for when the editor has no options

	/* Functions for adding the optional element */
	function add() {
		console.log('adding')
		isHovered = false;
		const allOptions = getOptions();
		filteredOptions = allOptions;
		console.log(allOptions.map(opt => opt.label))
		if (allOptions.length > 1) {
			console.log('showing dropdown')
			showDropdown();
		} else {
			box.executeOption(editor, allOptions[0]);
			isEmpty = false;
		}
	}

	/* Functions that handle the dropdown */
	const showDropdown = async () => {
		dropdownShown = true;
		// wait until DOM updates and styles/layout settle
		await tick();

		// now wait one more frame so images/css apply
		requestAnimationFrame(() => {
		    if (dropdownCmp) {
		        dropdownCmp?.scrollIntoViewIfNeeded();
		    }
		});
	};

	const getOptions = (): SelectOption[] => {
		let result = box?.getOptions(editor);
		if (isNullOrUndefined(result)) {
			result = [{ id: noOptionsId, label: '<no known options>' }];
		}
		console.log(`getOptions ${result[0]?.label}`);
		return result;
	};

	const itemSelected = (sel: SelectOption) => {
		console.log('item selected is ' + sel.label)
		dropdownShown = false;
		box.executeOption(editor, sel);
		selectedOption = sel;
		isEmpty = false;
	}

	const onKeyDown = (event: KeyboardEvent) => {
		console.log(`onKeyDown: box(${box.id}) [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}` + "] meta [" + event.metaKey + "]" + ", selectedId: " + selectedOption?.id + " dropdown:" + dropdownShown);
		if (dropdownShown) {
			if (!event.ctrlKey && !event.altKey) {
				switch (event.key) {
					case ARROW_DOWN: {
						if (dropdownShown) {
							// if stat removed
							if (!selectedOption) {
								// there is no current selection: start at the first option
								selectFirstOption();
							} else {
								const index = filteredOptions.findIndex(
									(o) => o.id === selectedOption?.id
								);
								if (index + 1 < filteredOptions.length) {
									// the 'normal' case: go one down
									selectedOption = filteredOptions[index + 1];
								} else if (index + 1 === filteredOptions.length) {
									// the end of the options reached: go to the first
									selectFirstOption();
								}
							}
							event.preventDefault();
							event.stopPropagation();
						}
						break;
					}
					case ARROW_UP: {
						if (dropdownShown) {
							// if stat removed
							if (!selectedOption) {
								// there is no current selection, start at the last option
								selectLastOption();
							} else {
								const index = filteredOptions.findIndex(
									(o) => o.id === selectedOption?.id
								);
								if (index > 0) {
									// the 'normal' case: go one up
									selectedOption = filteredOptions[index - 1];
								} else if (index === 0) {
									// the beginning of the options reached: go to the last
									selectLastOption();
								}
							}
							event.preventDefault();
							event.stopPropagation();
						}
						break;
					}
					case ENTER: {
						// user wants current selection
						// find the chosen option
						handleEnterOrControlSpace(event)
						break;
					}
					default: {
						// handled by FreonComponent
					}
				}
			}
		}
	};

	function selectFirstOption() {
		if (dropdownShown) {
			if (filteredOptions?.length !== 0) {
				selectedOption = filteredOptions[0];
			}
		}
	}

	function selectLastOption() {
		if (dropdownShown) {
			if (filteredOptions?.length !== 0) {
				selectedOption = filteredOptions[filteredOptions.length - 1];
			}
		}
	}

	function handleEnterOrControlSpace(event: KeyboardEvent): void {
		let chosenOption: SelectOption | null = null;
		if (filteredOptions.length <= 1) {
			if (filteredOptions.length !== 0) {
				// if there is just one option left, choose that one
				chosenOption = filteredOptions[0];
			} else {
				// there are no valid options left
				editor.setUserMessage('No valid selection');
			}
		} else {
			// find the selected option and choose that one
			const index = filteredOptions.findIndex((o) => o.id === selectedOption?.id);
			if (index >= 0 && index < filteredOptions.length) {
				chosenOption = filteredOptions[index];
			}
		}
		// execute the option
		if (notNullOrUndefined(chosenOption)) {
			box.executeOption(editor, chosenOption);
			dropdownShown = false;
			isEmpty = false;
		} else {
			// TODO no valid option in dropdown
		}
		event.preventDefault();
		event.stopPropagation();

	}

	/* Functions to remove the optional element */
    function remove() {
        console.log('removing')
        isEmpty = true;
        box.removeContent();
    }

    const refresh = (why?: string): void => {
        console.log('REFRESH OptionalBox: ' + why);
        contentBox = box.content;
        isEmpty = box.isEmpty();
		placeholder = box.placeholder;
    };

    async function setFocus(): Promise<void> {
        console.log('setFocus on box ' + box.role);
        if (!isEmpty && notNullOrUndefined(contentComponent) && notNullOrUndefined(box.content.firstEditableChild)) {
            box.content.firstEditableChild.setFocus();
        } else if (notNullOrUndefined(addButtonComponent)) {
            addButtonComponent.focus();
        }
    }
    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Evaluated and re-evaluated when the box changes.
        refresh('Box changed ' + box?.id);
    });

	/* Functions and variables for the tooltip */
	let isHovered = $state(false);
	let x: number = $state(0);
	let y: number = $state(0);

	function mouseOver(event: MouseEvent) {
		isHovered = true;
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseMove(event: MouseEvent) {
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseLeave() {
		isHovered = false;
	}
	function onFocus() {
		console.log('onFocus')
		isHovered = true;
	}
	function onBlur() {
		console.log('onBlur')
		isHovered = false;
	}
</script>

<span class="optional-component {box.cssClass}" {id}
	  onkeydown={onKeyDown}
	  role="none"
>
	{#if isEmpty}
		<button
			onclick={add}
			onfocus={onFocus}
			onblur={onBlur}
			onmouseover={mouseOver}
			onmouseleave={mouseLeave}
			onmousemove={mouseMove}
			bind:this={addButtonComponent}>
			{addButtonTitle}
		</button>
		{#if isHovered}
			<div class='optional-tooltip' role="tooltip">
				{placeholder}
			</div>
		{/if}
		{#if dropdownShown}
			<DropdownComponent
				bind:this={dropdownCmp}
				bind:selected={selectedOption}
				bind:options={filteredOptions}
				selectionChanged={itemSelected}
			/>
		{/if}
	{:else}
        <button
			onclick={remove}
			onfocus={onFocus}
			onblur={onBlur}
			onmouseover={mouseOver}
			onmouseleave={mouseLeave}
			onmousemove={mouseMove}
		>
			{removeButtonTitle}
		</button>
		{#if isHovered}
			<div class='optional-tooltip' role="tooltip">
				remove optional element
			</div>
		{/if}
		<RenderComponent box={contentBox} {editor} bind:this={contentComponent} />
	{/if}
</span>

<style>
	.optional-tooltip {
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		background: white;
		color: black;
		border-radius: 4px;
		padding: 1px;
		position: absolute;
	}
</style>
