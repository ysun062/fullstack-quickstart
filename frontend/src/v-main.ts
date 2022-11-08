import { adoptStyleSheets, BaseHTMLElement, css, customElement, first, html, onEvent } from 'dom-native';

@customElement('v-main') // same as customElements.define('v-main', MainView) 
class MainView extends BaseHTMLElement { // extends native HTMLElement

	#clickCount = 0;

	@onEvent('pointerup', '.hello-box')
	async onHelloClick(evt: PointerEvent) {
		// just update the text
		first(this, '.hello-box strong')!.textContent = `from Client ${++this.#clickCount}`;

		let messageContent = '';

		//// EXAMPLE - hello1
		const r1 = await fetch('wapi/hello1');
		const obj1 = await r1.json();
		messageContent += obj1.message + '\n';

		//// EXAMPLE - hello1
		const r2 = await fetch('wapi/hello2');
		const obj2 = await r2.json();
		messageContent += obj2.message + '\n';

		//// EXAMPLE - hello3
		const r3 = await fetch('wapi/hello3');
		const obj3 = await r3.json();
		messageContent += obj3.message + '\n';

		//// EXAMPLE - display hello results
		first(this, '.message')!.textContent = messageContent;
	}

	init() { // called once on the first connectedCallback
		this.append(html`
			<div class="hello-box">
				<c-ico href="#ico-thumb"></c-ico>
				Hello <strong>From Client</strong>
				<div class="message">Click to get server hello</div>
			</div>
		`);
	}

}


//#region    ---------- c-ico ShadowDOM Component ---------- 
// in a real application, should be under `c-ico.ts`
const _shadowCss = css`
	:host{
		--fill: var(--clr-txt);

		display: inline-block;
		width: 1rem;
		height: 1rem;
		user-select: none;
	}
	svg{
		fill: var(--fill);
		width: 100%;
		height: 100%;
	}
`

@customElement('c-ico') // same as customElements.define('c-ico', IcoElement) 
class IcoElement extends HTMLElement {
	static BASE_URL = '/svg/sprite.svg'

	constructor() {
		super();

		let href = this.getAttribute('href');
		if (href?.startsWith('#')) {
			href = IcoElement.BASE_URL + href;
		}

		this.attachShadow({ mode: 'open' }).append(html`
			<svg> <use xlink:href="${href}" aria-hidden='true'></use></svg>
		`);


		adoptStyleSheets(this, _shadowCss);
	}

}
//#endregion ---------- /c-ico ShadowDOM Component ----------