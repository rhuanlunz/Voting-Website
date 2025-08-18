function createEntries(list) {
	const createEntryElement = (entry) => {
		const entryElement = document.createElement('div');
		entryElement.classList.add('entry');
		entryElement.setAttribute('id', entry.id);
		if (entry.id == selection) entryElement.classList.add('selected');

		const entryBox = document.createElement('div');

		const titleElement = document.createElement('div');
		titleElement.classList.add('title');
		titleElement.textContent = entry.title;

		const contentElement = document.createElement('div');
		contentElement.classList.add('content');
		contentElement.textContent = entry.content;

		const footerElement = document.createElement('div');
		footerElement.classList.add('footer');
		footerElement.textContent = entry.footer;

		entryBox.appendChild(titleElement);
		entryBox.appendChild(contentElement);
		entryBox.appendChild(footerElement);

		const voteButton = document.createElement('button');
		voteButton.classList.add('vote');
		// From material icons
		voteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" class="path"/></svg>';

		voteButton.addEventListener('click', event => postSelection(event.currentTarget, selection, popupBox));

		entryElement.appendChild(entryBox);
		entryElement.appendChild(voteButton);

		return entryElement;
	};

	jsonData.forEach((entry) => {
		if (entry.id == selection) {
			optionsContainer.appendChild(createEntryElement(entry));
		}
	});

	if (list.length > 0) {
		list.slice(0, 85).forEach((entry) => {
			if (entry.id != selection) {
				optionsContainer.appendChild(createEntryElement(entry));
			}
		});
	} else if (selection == -1) {
		const message = document.createElement('span');
		message.classList.add('loading');
		message.textContent = 'Nada encontrado!';
		optionsContainer.appendChild(message);
	}
}

async function postSelection() {
	// Clean all popups
	const popups = document.querySelectorAll('.popup, .error');
	for (const popup of popups) {
		if (popup.getAttribute('finished') === 'false') {
			popup.addEventListener('animationend', () => {
				popup.classList.add('popout');
				popup.addEventListener('animationend', () => {
					popup.remove();
				}, false);
			});
		} else {
			popup.classList.add('popout');
			popup.addEventListener('animationend', () => {
				popup.remove();
			});
		}
	}

	const popup = document.createElement('p');
	if (selection >= 0) {
		await new Promise((resolve, reject) => {
			const project = jsonData.find(o => o.id === selection).title;

			fetch("selection", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ id: selection, token: token }),
			}).then(data => {
				if (data.ok){
						resolve(`Voto confirmado para "${project}"`);
				  alert("Seu voto foi confirmado! Caso deseje, você pode alterar seu voto repetindo o processo.");
    } else {
					data.json().then(e => reject(e)).catch(() => {
						switch (data.status) {
							case 400:
								reject('Bad Request');
								break;
							case 401:
								reject('Unauthorized');
								break;
							case 403:
								reject('Forbidden');
								break;
							case 404:
								reject('Not Found');
								break;
							case 429:
								reject('Too Many Requests');
								break;
							case 500:
								reject('Internal Server Error');
								break;
							case 502:
								reject('Bad Gateway');
								break;
							case 503:
								reject('Service Unavailable');
								break;
							case 504:
								reject('Gateway Timeout');
								break;
							default:
								reject('Unknown Error');
								break;
						}
					});
				}
			});
		}).then(sel => {
			popup.textContent = sel;
			popup.classList.add('popup');
		}).catch(err => {
			console.error(err);
			popup.textContent = err;
			popup.classList.add('error');
		});
	} else {
		popup.textContent = 'Por favor, selecione um projeto';
		popup.classList.add('error');
	}

	// Popup animation handler
	popup.setAttribute('finished', false);
	popupBox.appendChild(popup);

	popup.addEventListener('animationend', () => {
		popup.setAttribute('finished', true);
	});

	setTimeout(() => {
		popup.classList.add('popout');
		popup.addEventListener('animationend', () => {
			popup.remove();
		}, false);
	}, 3000);
}


// Get token
const token = new URLSearchParams(window.location.search).get('token');

// Get entries
const jsonData = [];

// Get elements
const buttons = document.getElementsByTagName('button');
const inputElements = document.getElementsByTagName('input');
const optionsContainer = document.querySelector('.entries-container');
const popupBox = document.getElementById('popup-box');

let selection = -1;

async function init() {
	if (token != null) {
		let currentUrl = window.location.href;
		let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + "/projects";

		(await (await fetch(url)).json()).forEach((e, id) => {
			jsonData.push(e);
			jsonData[id].id = id;
		});

		// Shuffle the array
		let currentIndex = jsonData.length;
		while (currentIndex != 0) {
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[jsonData[currentIndex], jsonData[randomIndex]] = [
				jsonData[randomIndex], jsonData[currentIndex]];
		}
	}

	optionsContainer.addEventListener('click', (event) => {
		const entry = event.target.closest('.entry');
		if (entry) {
			const options = optionsContainer.querySelectorAll('.entry');
			options.forEach((option) => {
				option.classList.remove('selected');
			});
			entry.classList.add('selected');
			selection = Number(entry.getAttribute('id'));
		}
	});

	for (const inputElement of inputElements)
		inputElement.addEventListener('input', () => {
			const inputValue = inputElement.value.toLowerCase();
			const matches = jsonData.filter(entry => {
				return entry.title.toLowerCase().includes(inputValue) || entry.content.toLowerCase().includes(inputValue) || entry.footer.toLowerCase().includes(inputValue)
			});

			optionsContainer.innerHTML = '';
			createEntries(matches);
		});

	optionsContainer.innerHTML = '';
	createEntries(jsonData);
}

init();
