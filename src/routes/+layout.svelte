<script>
	import './styles.css';
	import github from '$lib/images/github.svg?url';
</script>

<div class="flex flex-col h-screen w-full">
	<main class="flex-1 w-full flex flex-col p-8 w-full items-center">
		<div class="max-w-screen-lg w-full">
			<slot />
		</div>
	</main>

	<footer class="flex justify-center items-center p-4">
		<img src={github} alt="Github" class="w-8" /><a
			class="font-bold ml-2"
			href="https://github.com/smithalan92"
			target="_blank">@smithalan92</a
		>
	</footer>
</div>
