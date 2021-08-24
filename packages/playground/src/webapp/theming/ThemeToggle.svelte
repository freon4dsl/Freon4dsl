<script>
    import { getContext } from "svelte";
    const { toggle } = getContext("theme");
    import { Button, Icon } from "svelte-mui";
    import invertColors from "../assets/icons/svg/invert_colors.svg";
</script>

<Button icon on:click={toggle}>
    <Icon style="color:var(--theme-colors-inverse_color)"> <svelte:component this={invertColors} /> </Icon>
</Button>

