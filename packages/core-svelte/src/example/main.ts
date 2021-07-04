import Example from './Example.svelte';

const exampleApp = new Example({
	target: document.body,
	props: {
		name: 'ProjectIt Svelte PoC'
	}
});

export default exampleApp;
