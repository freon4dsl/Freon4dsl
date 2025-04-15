<script lang="ts">
    import {ExternalStringBox, isNullOrUndefined} from "@freon4dsl/core";
    import type {FreComponentProps} from "@freon4dsl/core-svelte";
    import type {SvelteComponent} from "svelte";
    import { Button, Modal, Input, Helper } from 'flowbite-svelte';
    import {PersonChalkboardOutline} from 'flowbite-svelte-icons';


    // Props
    let { editor, box }: FreComponentProps<ExternalStringBox> = $props();

    let open = $state(false);
    let buttonLabel: string = $state('OpenDialog');
    let value: string | number = $state('');
    let inputElement: SvelteComponent;

    function initialize() {
        let tmpLabel: string | undefined = box.findParam('buttonLabel');
        buttonLabel = (!!tmpLabel && tmpLabel.length > 0) ? tmpLabel : 'Open Dialog';
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

<Modal title={buttonLabel} bind:open  autoclose aria-describedby="sheet-content">
        <Input bind:value={value} onchange={onChange} bind:this={inputElement} onkeydown={onKeyDown}>
            <PersonChalkboardOutline />
            <Helper >{buttonLabel}</Helper>
        </Input>
    <svelte:fragment slot="footer">
        <Button on:click={() => alert('Handle "success"')}>I accept</Button>
        <Button color="alternative">Decline</Button>
    </svelte:fragment>
</Modal>

<Button onclick={() => (open = true)}>
    {buttonLabel}
</Button>
