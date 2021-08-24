<!-- The AppBar is always shown at the top of the viewport -->
<!-- It contains the menus, the name of the language, and ... -->

<div class="app-bar">
	{#if $miniWindow}
		<!-- this button is shown only when the viewport is small -->
		<!-- it is used to open the left panel which shows the navigator -->
		<!-- the title is also smaller in a small viewport		-->
		<Button
			icon
			id="hamburger"
			color="inherit"
			on:click={() => {
				$leftPanelVisible = true;
			}}
		>
			<Icon style="color:var(--theme-colors-inverse_color)"> <svelte:component this={menu} /> </Icon>
		</Button>
		<div class="title">PIE for <i>{$languageName}</i></div>
	{:else}
		<!-- normally, the MenuGroup and a long title are shown-->
		<MenuGroup/>
		<div class="title">ProjectIt Environment for language <i>{$languageName}</i></div>
	{/if}

	<ThemeToggle />

	<Button icon color="inherit"
			on:click={() => {$rightPanelVisible = true}}
			ripple={false}
	>
		<Icon style="color:var(--theme-colors-inverse_color)">
			<svelte:component this={question_mark} />
		</Icon>
	</Button>

	{#if $miniWindow}
		<!-- normally, the brand icon is shown-->
		<a target="_blank" href="http://www.projectit.org">
			<!-- compiled svg does not work, because the path is too complex-->
			<img src="/img/projectit-logo-inverse-colors.png"  style="color:var(--theme-colors-inverse_color)" alt="ProjectIt Logo">
		</a>
	{/if}

</div>

<script lang="ts">
	import { Button, Icon } from "svelte-mui";

	import projectit_logo from "../assets/icons/svg/projectit-logo.svg";
	import question_mark from "../assets/icons/svg/help_24px.svg";
	import menu from "../assets/icons/svg/menu_black_24dp.svg";

	import { miniWindow, leftPanelVisible, rightPanelVisible } from "../webapp-ts-utils/WebappStore";
	import { languageName } from "../webapp-ts-utils/WebappStore";
	import MenuGroup from "../menu/MenuGroup.svelte";
	import ThemeToggle from "../theming/ThemeToggle.svelte";
</script>

<style>
	.app-bar {
		display: flex;
		align-items: center;
		height: var(--pi-header-height);
		color: #fff;
		background: var(--theme-colors-bg_app_bar);
		font-size: var(--pi-header-font-size);
		line-height: 1;
		min-width: inherit;
		padding: 0 4px 0 6px;
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		z-index: 20;
	}
	.title {
		flex: 1;
		margin-left: 0.5rem;
		white-space: nowrap;
		color: var(--theme-colors-inverse_color);
	}

	img{
		max-width: 180px;
		max-height: calc(var(--pi-header-height) - 5px);
		margin-top: 3px;
		margin-bottom: 3px;
		margin-left: auto;
		margin-right: 10px;
	}
</style>
