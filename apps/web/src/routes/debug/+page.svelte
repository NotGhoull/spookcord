<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { orpc } from '$lib/orpc';

	let dataForUserId = $state();
	let dataForUserOutput = $state();

	let dataForServerCreation = $state();
	let dataForServerCreationOutput = $state();
</script>

<div class="p-3">
	<h1 class="mb-5 text-xl">Debug page</h1>

	<div class="flex flex-col gap-2">
		<div class="w-full border"></div>
		<p>Get data for user</p>
		<div class="flex">
			<Input bind:value={dataForUserId} />
			<Button
				onclick={async () => {
					console.log('Fired!');
					dataForUserOutput = await orpc.getUserById.call({ id: dataForUserId });
				}}>Fire</Button
			>
		</div>
		<pre>
		    {JSON.stringify(dataForUserOutput, null, 2) ?? 'No output'}

		</pre>
		<div class="w-full border"></div>

		<p>Create server</p>
		<div class="flex">
			<Input bind:value={dataForServerCreation} />
			<Button
				onclick={async () => {
					console.log('Fired!');
					dataForUserOutput = await orpc.createNewServer.call({
						serverName: dataForServerCreation
					});
				}}>Fire</Button
			>
		</div>
		<pre>
		    {JSON.stringify(dataForServerCreationOutput, null, 2) ?? 'No output'}

		</pre>
		<div class="w-full border"></div>
	</div>
</div>
