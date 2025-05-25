/**
 * Formats a given Date object into a human-readable relative time string.
 * Examples: "just now", "5 minutes ago", "yesterday", "May 20, 2025"
 * @param date The Date object to format.
 * @returns A string representing the relative time.
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30.436875); // Average days in a month
	const years = Math.floor(days / 365.25); // Average days in a year

	if (seconds < 5) {
		return 'Just now';
	}
	if (seconds < 60) {
		return `${seconds} Seconds ago`;
	}
	if (minutes < 60) {
		return `${minutes} Minute${minutes === 1 ? '' : 's'} ago`;
	}
	if (hours < 24) {
		return `${hours} Hour${hours === 1 ? '' : 's'} ago`;
	}
	if (days < 2) {
		return 'Yesterday';
	}
	if (days < 7) {
		return `${days} Day${days === 1 ? '' : 's'} ago`;
	}
	if (weeks < 4) {
		// Up to roughly 4 weeks (1 month)
		return `${weeks} Week${weeks === 1 ? '' : 's'} ago`;
	}
	if (months < 12) {
		return `${months} Month${months === 1 ? '' : 's'} ago`;
	}
	if (years >= 1) {
		return `${years} Year${years === 1 ? '' : 's'} ago`;
	}

	// Fallback for very old dates or future dates (though unlikely for createdAt)
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}
