<script lang="ts">
	import { messageInfo, userMessageOpen, WebappConfigurator } from "$lib"
	import Dialog from "$lib/dialogs/Dialog.svelte"
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { CloseButton } from "flowbite-svelte"
	
	const close = () => {
		userMessageOpen.value = false
		WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
	}
</script>

<Dialog open={userMessageOpen.value}>
	<div class="flex flex-end p-0 m-0 w-full border-b border-light-base-300 dark:border-dark-base-800">
		<h3 class="mb-4 text-xl font-medium text-light-accent-900 dark:text-dark-accent-50">{messageInfo.severity}</h3>
		<CloseButton onclick={close} class="dark:text-dark-base-50 ml-auto" />
	</div>
	<div role="alert" class="text-sm rounded-lg flex items-center p-1 m-2 gap-1 bg-light-accent-600 dark:bg-dark-accent-200 text-light-accent-50 dark:text-dark-accent-900">
		<InfoCircleSolid class="w-5 h-5"/>
		<div>{messageInfo.userMessage}</div>
	</div>
</Dialog>

