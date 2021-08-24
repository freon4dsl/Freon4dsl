<!-- this component shows a message to the user in a snackbar at the top of the page -->
<!-- the content, severity, and whether or not the message is shown is triggered by the elements in WebappStore -->

<Snackbar style="font-size:var(--pi-error-font-size); font-weight: bold;"
          bind:visible
          bg={bgs[colorpicker]}
          color={txtcolors[colorpicker]}
          {timeout}>
    {$errorMessage}
    <span slot="action">
        <Button style="font-size:var(--pi-button-font-size); font-weight: bold;" color={btcolors[colorpicker]} on:click={() => {visible=false}}>Close</Button>
    </span>
</Snackbar>

<script lang="ts">
    import { Snackbar, Button } from 'svelte-mui';
    import {showError, errorMessage, severity} from "../webapp-ts-utils/WebappStore";

    let visible: boolean;
    $: visible = $showError;

    // background and font color are determined based on severity of the message
    let colorpicker: number;
    $: colorpicker = $severity;
    // background color depending on severity type
    // order is: info, hint, warning, error, see WebappStore.ts
    let bgs = [ 'var(--theme-colors-user_mess_bg_info)',
                'var(--theme-colors-user_mess_bg_hint)',
                'var(--theme-colors-user_mess_bg_warning)',
                'var(--theme-colors-user_mess_bg_error)'];
    // text color depending on severity type
    let txtcolors = ['var(--theme-colors-user_mess_text_info)',
        'var(--theme-colors-user_mess_text_hint)',
        'var(--theme-colors-user_mess_text_warning)',
        'var(--theme-colors-user_mess_text_error)'];
    // button text color depending on severity type
    let btcolors = ['var(--theme-colors-user_mess_button_text_info)',
                    'var(--theme-colors-user_mess_button_text_hint)',
                    'var(--theme-colors-user_mess_button_text_warning)',
                    'var(--theme-colors-user_mess_button_text_error)'];

    // the following code is needed to adjust 'showError' when the timeout fires
    $: if (visible == false) {
        showError.set(false);
    }
    let timeout: number = 10;
</script>


