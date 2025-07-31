<script lang="ts">
    import { ExternalStringBox, isNullOrUndefined, notNullOrUndefined } from "@freon4dsl/core"
    import type {FreComponentProps} from "@freon4dsl/core-svelte";
    import type {SvelteComponent} from "svelte";
    import { Button, Modal, Input, Helper } from 'flowbite-svelte';
    import {PersonChalkboardOutline} from 'flowbite-svelte-icons';


    // Props
    let { editor, box }: FreComponentProps<ExternalStringBox> = $props();

    let open = $state(false);
    let buttonLabel: string = $state('OpenDialog');
    let value: string | number = $state('');
    let inputElement: HTMLInputElement;

    function initialize() {
        let tmpLabel: string | undefined = box.findParam('buttonLabel');
        buttonLabel = (notNullOrUndefined(tmpLabel) && tmpLabel.length > 0) ? tmpLabel : 'Open Dialog';
        let tmpValue: string | undefined = box.getPropertyValue();
        if (!isNullOrUndefined(tmpValue)) {
            value = tmpValue;
        }
    }

    const onChange = () => {
        box.setPropertyValue(value);
    }

    const onKeyDown = (event: KeyboardEvent) => {
        event.stopPropagation();
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (open) {
            console.log("OPEN: setting focus to child")
            inputElement.focus();
        } else {
            console.log("CLOSED: setting focus to parent")
            if (!isNullOrUndefined(box.parent.firstEditableChild)) {
                box.parent.firstEditableChild.setFocus();
            }
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        initialize();
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    initialize();
    // Svelte: Type 'SvelteComponent<$$ComponentProps, { [evt: string]: CustomEvent<any>; }, {}> & { $$bindings?: "value" | "files" | "invalid" | "dirty" | undefined; } & { ...; }' is missing the following properties from type 'HTMLTextAreaElement': autocomplete, cols, defaultValue, dirName, and 318 more.
</script>

<Modal title={buttonLabel} bind:open  autoclose aria-describedby="sheet-content" class="text-light-base-900 dark:text-dark-base-50" >
        <Input>
          <div class="flex justify-start">
<!--  see https://flowbite-svelte.com/docs/forms/input-field#Advanced_usage        -->
          <input
            type="text"
            id="new-input"
            name="unit-name"
            bind:value={value} onchange={onChange} onkeydown={onKeyDown}
            bind:this={inputElement} />
          </div>
          <Helper >{buttonLabel}</Helper>
        </Input>
    {#snippet footer()}
        <Button class="text-light-base-900 dark:text-dark-base-50 bg-light-accent-100 dark:bg-dark-accent-100" onclick={() => alert('Handle "success"')}>I accept</Button>
        <Button color="alternative">Decline</Button>
    {/snippet}
</Modal>

<Button class="text-light-base-900 dark:text-dark-base-50" onclick={() => (open = true)}>
    {buttonLabel}
</Button>
