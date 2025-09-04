// scrollDebug.ts
type Cleanup = () => void;

function getScrollAncestors(el: HTMLElement | null) {
	const out: Array<{
		el: HTMLElement;
		oy: string;
		ox: string;
		clientH: number;
		scrollH: number;
		clientW: number;
		scrollW: number;
	}> = [];
	for (let p = el?.parentElement; p; p = p.parentElement) {
		const cs = getComputedStyle(p);
		const oy = cs.overflowY;
		const ox = cs.overflowX;
		const isScrollStyle = /(auto|scroll|overlay)/.test(oy + ox);
		const overflows =
			p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth;

		if (isScrollStyle || overflows) {
			out.push({
				el: p,
				oy,
				ox,
				clientH: p.clientHeight,
				scrollH: p.scrollHeight,
				clientW: p.clientWidth,
				scrollW: p.scrollWidth
			});
		}
	}
	return out;
}

function outline(el: HTMLElement) {
	const prev = el.style.outline;
	el.style.outline = '2px dashed red';
	el.style.outlineOffset = '2px';
	return () => {
		el.style.outline = prev;
		el.style.outlineOffset = '';
	};
}

function makeHud() {
	const hud = document.createElement('div');
	hud.style.position = 'fixed';
	hud.style.bottom = '12px';
	hud.style.right = '12px';
	hud.style.maxWidth = 'min(60ch, 90vw)';
	hud.style.maxHeight = '40vh';
	hud.style.overflow = 'auto';
	hud.style.zIndex = '999999';
	hud.style.font = '12px/1.4 system-ui, sans-serif';
	hud.style.background = 'rgba(0,0,0,.8)';
	hud.style.color = 'white';
	hud.style.padding = '10px 12px';
	hud.style.borderRadius = '8px';
	hud.style.boxShadow = '0 6px 20px rgba(0,0,0,.35)';
	hud.style.whiteSpace = 'pre-wrap';
	hud.style.userSelect = 'text';
	hud.style.cursor = 'default';
	hud.innerHTML = '<b>Scroll Debug</b> (click a row to re-outline)';
	document.body.appendChild(hud);
	return hud;
}

export function scrollDebug(node: HTMLElement) {
	// node should be your dropdown menu element
	const hud = makeHud();
	const cleanups: Cleanup[] = [];

	function refresh() {
		// Clear outlines
		while (cleanups.length) cleanups.pop()?.();

		const rows = getScrollAncestors(node);
		const lines: string[] = [];
		lines.push('');
		lines.push('Idx  Tag#id.class           overflowY overflowX   clientH  scrollH');
		lines.push('---- ---------------------- --------- --------- -------- --------');

		rows.forEach((r, i) => {
			const label =
				`${r.el.tagName.toLowerCase()}` +
				(r.el.id ? `#${r.el.id}` : '') +
				(r.el.className
					? '.' + String(r.el.className).trim().replace(/\s+/g, '.')
					: '');

			lines.push(
				`${String(i).padEnd(4)} ${label.padEnd(22).slice(0,22)} ` +
				`${r.oy.padEnd(9)} ${r.ox.padEnd(9)} ` +
				`${String(r.clientH).padStart(7)} ${String(r.scrollH).padStart(7)}`
			);

			// Outline likely culprits (overflow set OR content taller)
			if (/(auto|scroll|overlay)/.test(r.oy) || r.scrollH > r.clientH) {
				cleanups.push(outline(r.el));
			}
		});

		hud.innerHTML =
			'<b>Scroll Debug</b> (click a row to re-outline)<br><code style="display:block; margin-top:6px; white-space:pre">' +
			lines.join('\n') +
			'</code>';

		// Click-to-reoutline
		hud.onclick = (e) => {
			const sel = prompt('Enter index to outline (as shown in HUD):');
			if (sel == null) return;
			const idx = Number(sel);
			if (!Number.isFinite(idx) || !rows[idx]) return;
			cleanups.push(outline(rows[idx].el));
			rows[idx].el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		};
	}

	// Keep it up-to-date while the menu is open/positioned
	const ro = new ResizeObserver(refresh);
	ro.observe(document.documentElement);
	ro.observe(document.body);
	let rafId: number;
	const onScroll = () => {
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(refresh);
	};
	window.addEventListener('scroll', onScroll, true);
	window.addEventListener('resize', onScroll);

	// Initial paint
	refresh();

	return {
		destroy() {
			cleanups.forEach((c) => c());
			ro.disconnect();
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onScroll);
			hud.remove();
		}
	};
}
