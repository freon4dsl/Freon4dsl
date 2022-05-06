<script lang="ts">
	import Button from '@smui/button';
	import type { TopAppBarComponentDev } from '@smui/top-app-bar';
	import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import type { MenuComponentDev } from '@smui/menu';
	import { Label, Icon } from '@smui/common';
	import { Svg, H1 } from '@smui/common/elements';
	import Dialog, { Content, Actions, InitialFocus } from '@smui/dialog';
	import { mdiGithub, mdiWeb, mdiWeatherNight, mdiWeatherSunny, mdiHelp, mdiMenu } from '@mdi/js';
	import EditMenu from '../components/EditMenu.svelte';
	import { drawerOpen } from '../stores/DrawerStore.ts';
	import { userMessage, userMessageOpen } from '../stores/UserMessageStore.ts';

	let menu: MenuComponentDev;
	let active = 'Home';

	// Theming
	let topAppBar: TopAppBarComponentDev;

	let lightTheme: boolean =
		typeof window === 'undefined' || window.matchMedia('(prefers-color-scheme: light)').matches;

	function switchTheme() {
		lightTheme = !lightTheme;
		let themeLink = document.head.querySelector<HTMLLinkElement>('#theme');
		if (!themeLink) {
			themeLink = document.createElement('link');
			themeLink.rel = 'stylesheet';
			themeLink.id = 'theme';
		}
		themeLink.href = `/smui${lightTheme ? '' : '-dark'}.css`;
		document.head
			.querySelector<HTMLLinkElement>('link[href$="/smui-dark.css"]')
			?.insertAdjacentElement('afterend', themeLink);
	}

	// dialog
	let dialogOpen = false;

	function closeHandler(e: CustomEvent<{ action: string }>) {
		switch (e.detail.action) {
			case 'none':
				$userMessage = 'Ok, well, you\'re wrong.';
				break;
			case 'all':
				$userMessage = 'You are correct. All dogs are the best dog.';
				break;
			default:
				// This means the user clicked the scrim or pressed Esc to close the dialog.
				// The actions will be "close".
				$userMessage = 'It\'s a simple question. You should be able to answer it.';
				break;
		}
		$userMessageOpen = true;
	}

</script>


<TopAppBar bind:this={topAppBar} variant="standard" dense>
	<Row>
		<Section align="start" >
			<IconButton on:click={() => ($drawerOpen = !$drawerOpen)}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiMenu} />
				</Icon>
			</IconButton>
			<EditMenu/>
			<Button on:click={() => (dialogOpen = true)}>
				<Label>Open Dialog</Label>
			</Button>
		</Section>
		<Section align='center'>
			<Button>Freon App</Button>
		</Section>
		<Section align="end" toolbar>
			<IconButton aria-label="GitHub" target="_blank" href="https://github.com/projectit-org/ProjectIt">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiGithub} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Documentation Site" target="_blank" href="https://www.projectit.org/">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiWeb} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Help Page" target="_blank" href="/Help">
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={mdiHelp} />
				</Icon>
			</IconButton>
			<IconButton aria-label="Theme Toggle" on:click={switchTheme}>
				<Icon component={Svg} viewBox="0 0 24 24">
					<path fill="currentColor" d={lightTheme ? mdiWeatherNight : mdiWeatherSunny}}></path>
				</Icon>
			</IconButton>
		</Section>
	</Row>
</TopAppBar>


<Dialog
	bind:open={dialogOpen}
	aria-labelledby="event-title"
	aria-describedby="event-content"
	on:SMUIDialog:closed={closeHandler}
>
	<Title id="event-title">The Best Dog</Title>
	<Content id="event-content">
		Out of all the dogs, which is the best dog?
	</Content>
	<Actions>
		<Button action="none">
			<Label>None of Them</Label>
		</Button>
		<Button action="all" default use={[InitialFocus]}>
			<Label>All of Them</Label>
		</Button>
	</Actions>
</Dialog>

<AutoAdjust {topAppBar} >
		<div class='main-frame'>
			<slot />
		</div>
</AutoAdjust>

<style>
	.main-frame {
			margin: 10px;
  }
</style>
