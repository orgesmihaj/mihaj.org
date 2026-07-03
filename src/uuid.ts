function uuidv7(): string {
	const now = BigInt(Date.now());
	const ts = now & 0xffffffffffffn;
	const randA = BigInt(Math.floor(Math.random() * 0x1000));
	const randBHi = BigInt(Math.floor(Math.random() * 0x3fff));
	const randBLo = BigInt(Math.floor(Math.random() * 0x100000000));

	const hi = (ts << 16n) | (7n << 12n) | randA;
	const lo = (0b10n << 62n) | (randBHi << 32n) | randBLo;

	const toHex = (n: bigint, bits: number) => n.toString(16).padStart(bits / 4, '0');
	const h = toHex(hi, 64);
	const l = toHex(lo, 64);

	return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), l.slice(0, 4), l.slice(4, 16)].join('-');
}

interface UUIDBreakdown {
	timestamp: string;
	timestampMs: number;
	iso: string;
	randA: string;
	variant: string;
	randB: string;
}

function parseBreakdown(uuid: string): UUIDBreakdown {
	const hex = uuid.replace(/-/g, '');
	const ts = BigInt('0x' + hex.slice(0, 12));

	return {
		timestamp: hex.slice(0, 12),
		timestampMs: Number(ts),
		iso: new Date(Number(ts)).toISOString(),
		randA: hex.slice(13, 16),
		variant: hex.slice(16, 17),
		randB: hex.slice(17),
	};
}

function row(label: string, value: string, desc: string): string {
	return `<div class="breakdown-row">
		<span class="breakdown-label">${label}</span>
		<span class="breakdown-value">${value}</span>
		<span class="breakdown-desc">${desc}</span>
	</div>`;
}

function renderBreakdown(uuid: string): void {
	const uuidEl = document.getElementById('uuid')!;
	uuidEl.innerHTML =
		`<span class="segment-ts">${uuid.slice(0, 8)}-${uuid.slice(9, 13)}</span>` +
		`-<span class="segment-ver">${uuid.slice(14, 18)}</span>` +
		`-<span class="segment-rand">${uuid.slice(19, 23)}-${uuid.slice(24)}</span>`;

	const b = parseBreakdown(uuid);
	document.getElementById('breakdown')!.innerHTML = [
		row('Timestamp', `<span class="segment-ts">${b.timestamp}</span>`, `${b.timestampMs} ms · ${b.iso}`),
		row('Version', `<span class="segment-ver">7</span>`, 'bits 48–51'),
		row('rand_a', `<span class="segment-ver">${b.randA}</span>`, '12 random bits'),
		row('Variant', `<span class="segment-rand">${b.variant}</span>`, 'bits 64–65 → 10₂ (RFC 4122)'),
		row('rand_b', `<span class="segment-rand">${b.randB}</span>`, '62 random bits'),
	].join('');
}

function resetHint(): void {
	const hint = document.getElementById('hint')!;
	hint.textContent = 'Click to copy';
	hint.classList.remove('is-copied');
}

function generate(): void {
	current = uuidv7();
	renderBreakdown(current);
	resetHint();
}

function copyUUID(): void {
	navigator.clipboard.writeText(current).then(() => {
		const hint = document.getElementById('hint')!;
		hint.textContent = 'Copied!';
		hint.classList.add('is-copied');
		setTimeout(resetHint, 2000);
	});
}

let current = uuidv7();
renderBreakdown(current);

document.getElementById('generate')!.addEventListener('click', generate);

const uuidEl = document.getElementById('uuid')!;
uuidEl.addEventListener('click', copyUUID);
uuidEl.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		copyUUID();
	}
});

document.addEventListener('keydown', (e) => {
	const target = e.target as HTMLElement;
	if (e.key === 'g' && !e.metaKey && !e.ctrlKey && target.tagName !== 'INPUT') {
		generate();
	}
});
