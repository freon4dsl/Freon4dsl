<!-- The AppBar is always shown at the top of the viewport -->
<!-- It contains the menus, the name of the language, and ... -->

<div class="app-bar" bind:this={el}>
	<!-- this button is shown only when the viewport is small -->
	<!-- it is used to open the left panel which shows the navigator -->
	<Button
		icon
		id="hamburger"
		color="inherit"
		on:click={() => {
			leftPanelVisible = true;
		}}
	>
		<Icon path={menu} />
	</Button>

	<MenuGroup/>

	<div class="title">ProjectIt Language Environment for language ...</div>

	{#if !legacy}
		<Button icon on:click={() => setTheme($theme === 'dark' ? 'light' : 'dark')}>
			<Icon style="color:var(--inverse-color)" path={invertColors} />
		</Button>
	{/if}
	<Button icon color="inherit"
			on:click={() => (rightPanelVisible = true)}
			ripple={false}
	>
		<!-- <Icon path={search} />-->
		<Icon>
			<svelte:component this={question_mark} />
		</Icon>
	</Button>
	<a id="brand" class="icon" target="_blank" href="http://www.projectit.org">
		<!-- compiled svg -->
<!--		<Icon viewBox="0 0  24 24" color="red">-->
<!--			<svelte:component this={projectit_logo} />-->
<!--		</Icon>-->
		<img src="/img/projectit-logo-inverse-colors.png" alt="ProjectIt Logo">
	</a>

</div>

<script>
	import MenuGroup from "../menu/MenuGroup.svelte";

	export let fade = false;
	export let leftPanelVisible = false;
	export let rightPanelVisible = false;

	import {onMount} from 'svelte';

	import {Button, Icon} from 'svelte-mui';
	import {menu, invertColors} from '../assets/icons';
	import question_mark from '../assets/icons/svg/help_24px.svg';
	import projectit_logo from '../assets/icons/svg/projectit-logo.svg';

	import {theme} from '../store';

	let el;
	let legacy = true;

	const darkTheme = {
		'--color': '#eee',
		'--alternate': '#000',
		'--bg-color': '#303134',
		'--primary': '#3ea6ff',
		'--accent': '#ff6fab',
		'--divider': 'rgba(255,255,255,0.175)',
		'--bg-popover': '#3f3f3f',
		'--border': '#555',
		'--label': 'rgba(255,255,255,0.5)',
		'--bg-input-filled': 'rgba(255,255,255,0.1)',

		'--bg-app-bar': '#838383',
		'--bg-panel': '#434343',

		'--focus-color': 'rgba(62, 166, 255, 0.5)', // primary with alpha
	};

	$: if (el) {
		fade
				? (el.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,.2), 0 2px 6px 2px rgba(0,0,0,.18)')
				: (el.style.boxShadow = '');
	}

	onMount(async () => {
		try {
			legacy = !(window.CSS && window.CSS.supports && window.CSS.supports('(--foo: red)'));

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
