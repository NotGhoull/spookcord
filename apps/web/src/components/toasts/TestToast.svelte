<script>
	import { CircleCheckBigIcon } from '@lucide/svelte';
</script>

<div class="toast">
	<div class="toast-header">
		<div class="icon-container">
			<CircleCheckBigIcon class="size-6" />
		</div>
		<div class="toast-content">
			<div class="toast-title">Friend request accepted</div>
			<div class="toast-message"><b>NotGhoul_</b> has accepted your friend request</div>
		</div>
		<button class="close-btn">×</button>
	</div>
	<div class="toast-actions">
		<button class="send-message-btn"> Send Message </button>
	</div>
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 1000;
	}

	.toast {
		display: flex;
		flex-direction: column;
		background-color: #2a2a2a;
		color: #ffffff;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		width: 380px;
		animation: slideIn 0.3s ease-out forwards;
	}

	.toast-header {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background-color: #ff6b00;
		margin-right: 14px;
		flex-shrink: 0;
	}

	.toast-content {
		flex-grow: 1;
	}

	.toast-title {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 4px;
	}

	.toast-message {
		font-size: 14px;
		opacity: 0.9;
	}

	.toast-message b {
		font-weight: bold;
	}

	.toast-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
	}

	.send-message-btn {
		background-color: transparent;
		color: #ff6b00;
		border: 1px solid #ff6b00;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.send-message-btn:hover {
		background-color: rgba(255, 107, 0, 0.1);
	}

	.close-btn {
		background: transparent;
		border: none;
		color: #aaa;
		font-size: 18px;
		cursor: pointer;
		margin-left: auto;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: #fff;
	}
</style>
