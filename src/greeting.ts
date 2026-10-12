// Albanian greeting for the visitor's local time of day.

function greetingFor(hour: number): string {
	if (hour >= 5 && hour < 12) return 'Mirëmëngjes'; // good morning
	if (hour >= 18 || hour < 5) return 'Mirëmbrëma'; // good evening
	return 'Tungjatjeta'; // hello
}

const el = document.querySelector<HTMLElement>('[data-greeting]');
if (el) el.textContent = greetingFor(new Date().getHours());
