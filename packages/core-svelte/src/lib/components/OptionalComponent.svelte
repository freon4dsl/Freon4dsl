<script lang="ts">
	import { componentId, portal, useOverlayListeners, usePaneContext } from "./svelte-utils/index.js"
	import type { FreComponentProps } from "./svelte-utils/FreComponentProps.js"
	import {
		ARROW_DOWN,
		ARROW_UP,
		BACKSPACE,
		type Box,
		DELETE,
		ENTER,
		isNullOrUndefined,
		notNullOrUndefined,
		type OptionalBox,
		type SelectOption
	} from "@freon4dsl/core"
	import DropdownComponent from "./DropdownComponent.svelte"
	import RenderComponent from "./RenderComponent.svelte"
	import DeleteIcon from "./images/DeleteIcon.svelte"
	import AddIcon from "./images/AddIcon.svelte"
	import { tick } from "svelte"
	import { OPTIONAL_LOGGER } from "$lib/components/ComponentLoggers.js"
	import { computeDropdownLayout } from "$lib/components/svelte-utils/DropdownUtils.js"

	const LOGGER = OPTIONAL_LOGGER

    // Props
    let { editor, box, readonly = false }: FreComponentProps<OptionalBox> = $props()

    let id: string = $derived(notNullOrUndefined(box) ? componentId(box) : "optional-for-unknown-box") // an id for the HTML element showing the optional
    let isEmpty: boolean = $state(true)
    let placeholder: string = $state("add optional element")
    let contentBox: Box = $state()!
    let contentComponent: RenderComponent | undefined = $state()
    let addButtonComponent: HTMLButtonElement | undefined = $state()
    let showPlaceholderButton: boolean = $state(false)
    let dropdownShown: boolean = $state(false)
    let selectedOption: SelectOption | undefined = $state(undefined) // the selected option in the dropdown
    let allOptions: SelectOption[] = $state([])
    let filteredOptions: SelectOption[] = $state([]) // the list of filtered options that are shown in the dropdown
    let useFilteredDropdown: boolean = $state(true) // todo get this value from the edit config */
    let dropdownCmp: DropdownComponent | undefined = $state(undefined)
    const noOptionsId = "noOptions" // constant for when the editor has no options

    // elements for the use of the overlay to position the dropdown menu
    const pane = usePaneContext()
    let overlayRoot = $derived(pane?.getOverlayRoot() ?? null)
    // let dropdownAnchorEl: HTMLElement | null = $state(null)
    let dropdownPanelEl: HTMLElement | null = $state(null)
    let dropdownContentEl: HTMLElement | null = $state(null)
    const listeners = useOverlayListeners(() => ({
        pane,
        enabled: dropdownShown,
        closeFunc: hideDropdown,
        inside: [addButtonComponent, dropdownPanelEl, dropdownContentEl],
        closeOnResize: true
    }))

    /* Functions for adding the optional element */
    function add() {
        LOGGER.log("adding")
        allOptions = getOptions()
        filteredOptions = allOptions
        LOGGER.log(`${allOptions.map(opt => opt.label)}`)
        if (allOptions.length > 1) {
            LOGGER.log("showing dropdown")
            showDropdown()
        } else {
            box.executeOption(editor, allOptions[0])
        }
    }

    /* Functions that handle the dropdown */
	function updateDropdownPos() {
		if (!addButtonComponent || !dropdownPanelEl || !dropdownContentEl || !overlayRoot) return;

		const layout = computeDropdownLayout(
			addButtonComponent.getBoundingClientRect(),
			dropdownContentEl.getBoundingClientRect(),
			overlayRoot.getBoundingClientRect()
		);

		dropdownPanelEl.style.left = `${layout.left}px`;
		dropdownPanelEl.style.top = `${layout.top}px`;
		dropdownPanelEl.style.minWidth = `${layout.minWidth}px`;
		dropdownContentEl.style.maxHeight = `${layout.maxHeight}px`;
	}

    const hideDropdown = () => {
        dropdownShown = false
        listeners.detach()
    }

    const showDropdown = async () => {
        dropdownShown = true
        // wait until DOM updates and styles/layout settle
        await tick()
        // wait two more frames
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		updateDropdownPos()
        listeners.attach()
    }

    const getOptions = (): SelectOption[] => {
        let result = box?.getOptions(editor)
        if (isNullOrUndefined(result)) {
            result = [{ id: noOptionsId, label: "<no known options>" }]
        }
        LOGGER.log(`getOptions ${JSON.stringify(result)}`)
        return result
    }

    const itemSelected = (sel: SelectOption) => {
        LOGGER.log("item selected is " + sel.label)
        dropdownShown = false
        box.executeOption(editor, sel)
        selectedOption = sel
        // isEmpty = false;
    }

	const onKeyDown = (event: KeyboardEvent) => {
		LOGGER.log(
			`onKeyDown: box(${box.id}) [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}] meta [${event.metaKey}], selectedId: ${selectedOption?.id} dropdown:${dropdownShown}`
		);

		// Ignore modifier combinations (except where explicitly handled)
		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}

		// === DROPDOWN OPEN ===
		if (dropdownShown) {
			if (event.key === ARROW_DOWN || event.key === ARROW_UP) {
				dropdownCmp?.onArrowKey(event);
				return;
			}

			if (event.key === ENTER) {
				handleEnterOrControlSpace(event);
				return;
			}

			// everything else: let Freon / browser handle
			return;
		}

		// === DROPDOWN CLOSED ===
		if (isEmpty) {
			return;
		}

		if (event.key === BACKSPACE || event.key === DELETE) {
			remove();
			event.stopPropagation();
			event.preventDefault();
			return;
		}

		// default: let Freon / browser handle
	};

    function handleEnterOrControlSpace(event: KeyboardEvent): void {
        let chosenOption: SelectOption | null = null
        if (filteredOptions.length <= 1) {
            if (filteredOptions.length !== 0) {
                // if there is just one option left, choose that one
                chosenOption = filteredOptions[0]
            } else {
                // there are no valid options left
                editor.setUserMessage("No valid selection")
            }
        } else {
            // find the selected option and choose that one
            const index = filteredOptions.findIndex((o) => o.id === selectedOption?.id)
            if (index >= 0 && index < filteredOptions.length) {
                chosenOption = filteredOptions[index]
            }
        }
        // execute the option
        if (notNullOrUndefined(chosenOption)) {
            box.executeOption(editor, chosenOption)
            dropdownShown = false
            // isEmpty = false;
        } else {
            // TODO no valid option in dropdown
        }
        event.preventDefault()
        event.stopPropagation()

    }

    function onFocusOut() {
        LOGGER.log("onBlurSpan")
        dropdownShown = false
    }

    /* Functions to remove the optional element */
    function remove() {
        LOGGER.log("removing")
        // isEmpty = true;
        box.removeContent()
    }

    /* Functions to make the Component fit in the framework */
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH OptionalBox: " + why)
        contentBox = box.content
        isEmpty = box.isEmpty()
        placeholder = box.placeholder
        showPlaceholderButton = box.showPlaceholderButton
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("setFocus on box " + box.role + " isEmpty " + isEmpty)
        if (!isEmpty && notNullOrUndefined(contentComponent)) {
            LOGGER.log("setting focus on content of optional")
            editor.selectFirstLeafChildBox()
        } else if (notNullOrUndefined(addButtonComponent)) {
            addButtonComponent.focus()
        }
    }

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus
        box.refreshComponent = refresh
        // Evaluated and re-evaluated when the box changes.
        refresh("Box changed " + box?.id)
    })
</script>

{#if readonly}
	<span class="optional-component {box.cssClass} readonly" {id}
          role="none"
    >
		{#if isEmpty}
			<span class="optional-component-tooltip-anchor readonly">
			  <button
				  class="optional-component-button {showPlaceholderButton ? 'text-mode' : ''} readonly"
				  aria-label="Add optional component"
			  >
				  {#if showPlaceholderButton}
					<span class="optional-component-placeholder readonly">+ {placeholder}</span>
				  {:else}
					<AddIcon />
				  {/if}
			  </button>

			  <span class="optional-component-tooltip" role="tooltip">
				Add {placeholder}
			  </span>
			</span>
		{:else}
			<span class="optional-component-tooltip-anchor">
			  <button
				  class="optional-component-button"
				  aria-label="Remove optional component"
				  tabindex="-1"
			  >
				<DeleteIcon />
			  </button>

			  <span class="optional-component-tooltip" role="tooltip">
				Remove {placeholder}
			  </span>
			</span>
			<RenderComponent box={contentBox} {editor} {readonly} />
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
					<span class="optional-component-placeholder">+ {placeholder} opt</span>
				  {:else}
					<AddIcon />
				  {/if}
			  </button>

			  <div class="optional-component-tooltip" role="tooltip">
				Add {placeholder}
			  </div>
                {#if dropdownShown}
					<div
                        class="text-dropdown-panel"
                        use:portal={overlayRoot}
                        bind:this={dropdownPanelEl}
                    >
						<div class="dropdown-component-container" bind:this={dropdownContentEl}>
							<DropdownComponent
                                bind:this={dropdownCmp}
                                bind:matchingOptions={filteredOptions}
                                bind:allOptions={allOptions}
                                bind:selected={selectedOption}
                                selectionChanged={itemSelected}
                                filterOptions={useFilteredDropdown}
                            />
						</div>
					</div>
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
					<DeleteIcon />
				</button>

				<div class="optional-component-tooltip" role="tooltip">
					Remove {placeholder}
				</div>
			</span>
			<RenderComponent box={contentBox} {editor} {readonly} bind:this={contentComponent} />
		{/if}
	</span>
{/if}
