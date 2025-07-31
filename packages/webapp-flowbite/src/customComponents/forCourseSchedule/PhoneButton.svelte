<script lang="ts">
    import { Toast } from "flowbite-svelte";
    import { PhoneOutline } from 'flowbite-svelte-icons';
    import { type FreComponentProps, RenderComponent } from "@freon4dsl/core-svelte";
    import { NumberWrapperBox } from "@freon4dsl/core";
    import { Button } from 'flowbite-svelte';

    // Props
    let { editor, box }: FreComponentProps<NumberWrapperBox> = $props();

    let clicked: number = 0;
    let showToast: boolean = $state(false);

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        box.childBox.setFocus();
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
    };
    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const colorCls: string = 'text-light-base-50 dark:text-dark-base-900 ';
    const buttonCls: string =
      'bg-light-base-600 					dark:bg-dark-base-200 ' +
      'hover:bg-light-base-900 		dark:hover:bg-dark-base-50 ' +
      'border-light-base-100 			dark:border-dark-base-800 ';
    const iconCls: string = 'ms-0 inline h-6 w-6';
</script>

<div class="wrapper">
    Phone number: <RenderComponent box={box.childBox} editor={editor}/>
    <Button tabindex={-1} id="about-button" class="{buttonCls} {colorCls} " name="ToastOpen" onclick={() => {clicked++; showToast = true}}>
    <PhoneOutline class="{iconCls}" />
    </Button>
</div>

{#if showToast}
    <Toast color="green" onclick={() => showToast = false}>
        This person has been called on number {box.getPropertyValue()}.
        {#snippet icon()}
            <PhoneOutline class="{iconCls}" />
        {/snippet}
    </Toast>
{/if}

<style>
    .wrapper {
        display:flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
</style>
