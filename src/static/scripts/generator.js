const button = document.getElementById('generate');
const container = document.getElementById('container');
const flex = document.getElementById('flex');
const passInput = document.getElementById('password-input');
const passBox = document.getElementById('password-box');
let imgBox = document.getElementById('img');
let load = [true, true];
let pass = false;

container.style.height = `${container.scrollHeight}px`;

async function handleQr() {
	if (pass) {
		if (!imgBox) {
			imgBox = document.createElement('div');
			imgBox.classList.add('img-box');
			container.appendChild(imgBox);
			container.style.height = `${container.scrollHeight}px`;
		}

		if (load[0] && load[1]) {
			const tim = setTimeout(() => {
				if (!load[1]) {
					button.classList.remove('disabled');
					for (const i in load) {
						load[i] = true;
					}
				}
			}, 10000);

			const img = document.createElement('img');

			let currentUrl = window.location.href;
			let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/generator'; 

			const res = URL.createObjectURL(await (await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					password: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(passInput.value)))).map(b => b.toString(16).padStart(2, '0')).join(''),
				}),
			})).blob());
			if (res)
				img.src = res;
			imgBox.innerHTML = '';
			img.onload = () => {
				load[1] = true;
				imgBox.appendChild(img)
				clearTimeout(tim);
				if (load[0])
					button.classList.remove('disabled');
			}

			button.classList.add('disabled');
			for (const i in load) {
				load[i] = false;
			}

			setTimeout(() => {
				load[0] = true;
				if (load[1])
					button.classList.remove('disabled');
			}, 3000);
		}
	}
}

passInput.addEventListener('keypress', async event => {
	if (event.key === 'Enter' || event.code === 'Enter') {
		let currentUrl = window.location.href;
		let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/validate'; 

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				password: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(passInput.value)))).map(b => b.toString(16).padStart(2, '0')).join(''),
			}),
		}).then(r => {
			if (r.ok) {
				passBox.style.display = 'none';
				flex.style.filter = 'none';
				button.classList.remove('disabled');
				pass = true;
			} else {
				passInput.value = '';
			}
		});
	}
});

button.addEventListener('click', () => { if (pass) handleQr() });
