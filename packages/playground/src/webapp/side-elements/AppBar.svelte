<!-- The AppBar is always shown at the top of the viewport -->
<!-- It contains the menus, the name of the language, and ... -->

<div class="app-bar">
	{#if !$miniWindow}
		<!-- this button is shown only when the viewport is small -->
		<!-- it is used to open the left panel which shows the navigator -->
		<!-- the title is also smaller in a small viewport		-->
		<Button
			icon
			id="hamburger"
			color="inherit"
			on:click={() => {
				leftPanelVisible = true;
			}}
		>
			<Icon style="color:var(--inverse-color)" path={menu} />
		</Button>
		<div class="title">PLE for <i>{$languageName}</i></div>
	{:else}
		<!-- normally, the MenuGroup and a long title are shown-->
		<MenuGroup/>
		<div class="title">ProjectIt Language Environment for language <i>{$languageName}</i></div>
	{/if}

	<Button icon on:click={() => setTheme($theme === 'dark' ? 'light' : 'dark')}>
		<Icon style="color:var(--inverse-color)" path={invertColors} />
	</Button>

	{#if !$miniWindow}
	<!-- help button is only shown in small viewport, in large viewport the help menu is directly visible	-->
		<Button icon color="inherit"
				on:click={() => (rightPanelVisible = true)}
				ripple={false}
		>
			<Icon style="color:var(--inverse-color)">
				<svelte:component this={question_mark} />
			</Icon>
		</Button>
	{:else}
		<!-- normally, the brand icon is shown-->
		<a id="brand" class="icon" target="_blank" href="http://www.projectit.org">
			<!-- compiled svg does not work, because the path is too complex-->
<!--			<Icon>-->
<!--				<svelte:component this={projectit_logo} />-->
<!--			</Icon>-->
			{#if $theme === 'light'}
				<img src="/img/projectit-logo-inverse-colors.png" alt="ProjectIt Logo">
				{:else if ($theme === 'dark')}
				<img src="/img/projectit-logo.png" alt="ProjectIt Logo">
			{/if}
		</a>
	{/if}

</div>

<script lang="ts">
	import {onMount} from 'svelte';
	import {Button, Icon} from 'svelte-mui';

	import projectit_logo from '../assets/icons/svg/projectit-logo.svg';
	import question_mark from '../assets/icons/svg/help_24px.svg';
	import {menu, invertColors} from '../assets/icons';
	import {theme, darkTheme, miniWindow} from '../store';
	import { languageName } from "../menu-ts-files/WebappStore";
	import MenuGroup from "../menu/MenuGroup.svelte";

	export let leftPanelVisible: boolean = false;
	export let rightPanelVisible: boolean = false;

	onMount(async () => {
		try {
			let mql = window.matchMedia('(prefers-color-scheme: dark)');
			mql.matches && setTheme('dark');
		} catch (err) {
		} // eslint-disable-line
	});

	function setTheme(name) {
		name = name.replace(/\s/g, '').toLowerCase();

		$theme = name;
		$theme === 'dark'
				? Object.keys(darkTheme).map((key) => {
					document.documentElement.style.setProperty(key, darkTheme[key]);
				})
				: document.documentElement.removeAttribute('style');
	}
</script>

<style>
	.app-bar {
		display: flex;
		align-items: center;
		height: var(--pi-header-height);
		color: #fff;
		background: var(--bg-app-bar);
		font-size: var(--header-font-size);
		line-height: 1;
		min-width: inherit;
		padding: 0 4px 0 6px;
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		/*z-index: 20;*/
	}
	.title {
		flex: 1;
		margin-left: 0.5rem;
		white-space: nowrap;
		color: var(--inverse-color);
		/*text-align: left;*/
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
