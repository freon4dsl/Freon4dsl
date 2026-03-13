<script lang="ts">
	import { componentId } from '../index.js';
	import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';
	import {
		type Box,
		type OptionalBox,
		type SelectOption,
		notNullOrUndefined,
		isNullOrUndefined,
		ARROW_DOWN,
		ARROW_UP,
		ENTER,
		DELETE,
		BACKSPACE
	} from "@freon4dsl/core";
	import DropdownComponent from './DropdownComponent.svelte';
	import RenderComponent from './RenderComponent.svelte';
	import DeleteIcon from "./images/DeleteIcon.svelte"
	import AddIcon from "./images/AddIcon.svelte"
	import { tick } from "svelte";
	import { OPTIONAL_LOGGER, } from "$lib/components/ComponentLoggers.js"

	const LOGGER = OPTIONAL_LOGGER;

	// Props
    let { editor, box, readonly }: FreComponentProps<OptionalBox> = $props();

    let id: string = $derived(notNullOrUndefined(box) ? componentId(box) : 'optional-for-unknown-box'); // an id for the HTML element showing the optional
    let isEmpty: boolean = $state(true);
	let placeholder: string = $state('add optional element');
    let contentBox: Box = $state()!;
    let contentComponent: RenderComponent | undefined = $state();
    let addButtonComponent: HTMLButtonElement | undefined = $state();
	let showPlaceholderButton: boolean = $state(false);
	let dropdownShown: boolean = $state(false);
	let selectedOption: SelectOption | undefined = $state(undefined); // the selected option in the dropdown
	let filteredOptions: SelectOption[] = $state([]); // the list of filtered options that are shown in the dropdown
	let dropdownCmp: DropdownComponent | undefined = $state(undefined);
	const noOptionsId = 'noOptions'; // constant for when the editor has no options

	/* Functions for adding the optional element */
	function add() {
		LOGGER.log('adding')
		const allOptions = getOptions();
		filteredOptions = allOptions;
		LOGGER.log(`${allOptions.map(opt => opt.label)}`)
		if (allOptions.length > 1) {
			LOGGER.log('showing dropdown')
			showDropdown();
		} else {
			box.executeOption(editor, allOptions[0]);
		}
	}

	/* Functions that handle the dropdown */
	const showDropdown = async () => {
		dropdownShown = true;
		// wait until DOM updates and styles/layout settle
		await tick();

		// now wait one more frame so images/CSS apply
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
		LOGGER.log(`getOptions ${JSON.stringify(result)}`);
		return result;
	};

	const itemSelected = (sel: SelectOption) => {
		LOGGER.log('item selected is ' + sel.label)
		dropdownShown = false;
		box.executeOption(editor, sel);
		selectedOption = sel;
		// isEmpty = false;
	}

	const onKeyDown = (event: KeyboardEvent) => {
		LOGGER.log(`onKeyDown: box(${box.id}) [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}` + "] meta [" + event.metaKey + "]" + ", selectedId: " + selectedOption?.id + " dropdown:" + dropdownShown);
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
		} else {
			if (!isEmpty) {
				switch (event.key) {
					case BACKSPACE:
					case DELETE: {
						remove();
						event.stopPropagation();
						event.preventDefault();
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
			// isEmpty = false;
		} else {
			// TODO no valid option in dropdown
		}
		event.preventDefault();
		event.stopPropagation();

	}

	function onFocusOut() {
		LOGGER.log('onBlurSpan')
		dropdownShown = false;
	}

	/* Functions to remove the optional element */
    function remove() {
        LOGGER.log('removing')
        // isEmpty = true;
        box.removeContent();
    }

	/* Functions to make the Component fit in the framework */
    const refresh = (why?: string): void => {
        console.log('REFRESH OptionalBox: ' + why);
        contentBox = box.content;
        isEmpty = box.isEmpty();
		placeholder = box.placeholder;
		showPlaceholderButton = box.showPlaceholderButton;
    };

    async function setFocus(): Promise<void> {
        console.log('setFocus on box ' + box.role + " isEmpty " + isEmpty);
        if (!isEmpty && notNullOrUndefined(contentComponent)) {
			console.log('setting focus on content of optional')
			editor.selectFirstLeafChildBox();
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
</script>

{#if readonly}
	<span class="optional-component {box.cssClass} readonly" {id}
		  role="none"
	>
	{#if isEmpty}
		<span class="optional-component-tooltip-anchor readonly" >
		  <button
			  class="optional-component-button {showPlaceholderButton ? 'text-mode' : ''} readonly"
			  aria-label="Add optional component"
		  >
			  {#if showPlaceholderButton}
				<span class="optional-component-placeholder readonly">{placeholder}</span>
			  {:else}
				<AddIcon />
			  {/if}
		  </button>

		  <span class="optional-component-tooltip" role="tooltip">
			Add {placeholder}
		  </span>

			{#if dropdownShown}
			<DropdownComponent
				bind:this={dropdownCmp}
				bind:selected={selectedOption}
				bind:options={filteredOptions}
				selectionChanged={itemSelected}
			/>
		  {/if}
		</span>

	{:else}
		<span class="optional-component-tooltip-anchor">
		  <button
			  class="optional-component-button"
			  aria-label="Remove optional component"
			  tabindex="-1"
		  >
			<DeleteIcon/>
		  </button>

		  <span class="optional-component-tooltip" role="tooltip">
			Remove {placeholder}
		  </span>
		</span>
		<RenderComponent box={contentBox} {editor} {readonly}  />
	{/if}
</span>
{:else}
	<span class="optional-component {box.cssClass}" {id}
		  onkeydown={onKeyDown}
		  onfocusout={onFocusOut}
		  role="none"
	>
		{#if isEmpty}
			<span class="optional-component-tooltip-anchor">
			  <button
				  class="optional-component-button {showPlaceholderButton ? 'text-mode' : ''}"
				  onclick={add}
				  aria-label="Add optional component"
				  bind:this={addButtonComponent}
			  >
				  {#if showPlaceholderButton}
					<span class="optional-component-placeholder">{placeholder}</span>
				  {:else}
					<AddIcon />
				  {/if}
			  </button>

			  <div class="optional-component-tooltip" role="tooltip">
				Add {placeholder}
			  </div>

				{#if dropdownShown}
				<DropdownComponent
					bind:this={dropdownCmp}
					bind:selected={selectedOption}
					bind:options={filteredOptions}
					selectionChanged={itemSelected}
				/>
			  {/if}
			</span>

		{:else}
			<span class="optional-component-tooltip-anchor">
			  <button
				  class="optional-component-button"
				  onclick={remove}
				  aria-label="Remove optional component"
				  tabindex="-1"
			  >
				<DeleteIcon/>
			  </button>

			  <div class="optional-component-tooltip" role="tooltip">
				Remove {placeholder}
			  </div>
			</span>
			<RenderComponent box={contentBox} {editor} {readonly} bind:this={contentComponent} />
		{/if}
	</span>
{/if}
