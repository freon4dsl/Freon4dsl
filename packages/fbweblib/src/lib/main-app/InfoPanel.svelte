<script>
	import { Tabs, TabItem, CloseButton } from "flowbite-svelte"
	import SearchResults from "$lib/main-app/SearchResults.svelte"
	import ErrorList from "$lib/main-app/ErrorList.svelte"
	import InterpreterResults from "$lib/main-app/InterpreterResults.svelte"
	import { infoPanel } from "$lib/stores/index.js"
	import { activeTab, errorTab, interpreterTab, searchTab } from "$lib/stores/InfoPanelStore.svelte.js"
</script>

<div>
	<div class="flex border-2 border-orange-500 p-0 m-0">
		<p class="p-2 text-lg font-semibold">Results for ...</p>
		<CloseButton onclick={() => (infoPanel.value = false)} class="dark:text-white ml-auto" />
	</div>
	<div>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit curae luctus donec, tellus metus sollicitudin vivamus dapibus turpis porttitor conubia dignissim ullamcorper duis, odio senectus pharetra consequat nullam eget hendrerit egestas praesent. Habitasse magna ullamcorper faucibus non dis in, ante at ridiculus fermentum nunc nec, quis cursus egestas felis curabitur. Euismod est volutpat malesuada suspendisse sociis libero habitasse, odio commodo dictum facilisis arcu felis dignissim penatibus, nunc vestibulum eros himenaeos congue cursus.</p>
		<p>Consequat vulputate senectus urna morbi aliquet mollis semper imperdiet, tempor penatibus congue netus sagittis vitae natoque lacus, vel mus nibh tortor aenean bibendum egestas. Nulla suscipit pretium dictum maecenas dis ullamcorper luctus accumsan, natoque placerat interdum facilisi habitant posuere curabitur, iaculis magna lacinia vehicula viverra elementum montes. Quis eget velit rhoncus non tempus vulputate mauris libero ac, ultricies platea at morbi facilisis potenti integer tempor eu, eros in ut condimentum aliquam montes volutpat pharetra.</p>
	</div>
<!--	<Tabs tabStyle="underline" class="border-2 border-blue-500">-->
<!--		<TabItem open={activeTab.value === searchTab} title="Search">-->
<!--			<SearchResults/>-->

<!--		</TabItem>-->
<!--		<TabItem open={activeTab.value === errorTab} title="Validation">-->
<!--			<ErrorList/>-->
<!--		</TabItem>-->
<!--		<TabItem open={activeTab.value === interpreterTab} title="Interpreter">-->
<!--			<InterpreterResults/>-->
<!--		</TabItem>-->
<!--	</Tabs>-->

</div>
