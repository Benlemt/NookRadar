const url = 'http://acnhapi.com/v1/';
const openModalBtn = document.getElementById("open-modal");
const closeModalBtn = document.getElementById("close-modal");
const hemisphereNorthBtn = document.getElementById("hemisphere-north");
const hemisphereNorthIco = document.getElementById('hemisphere_n_selected');
const hemisphereSouthBtn = document.getElementById("hemisphere-south");
const hemisphereSouthIco = document.getElementById('hemisphere_s_selected');
const modal = document.getElementById("modal");
let hemisphereCurrent = hemisphereNorthBtn;
let currentFilter = 'bugs';
const bugsBtn = document.getElementById('bugs');
const fishBtn = document.getElementById('fish');
const seaBtn = document.getElementById('sea');
let settings = {
    'hemisphere': 'nord',
    'month': (new Date()).getMonth(),
    'day': (new Date()).getDate(),
    'hour': (new Date()).getHours(),
    'minutes': (new Date()).getMinutes()
};
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const rarityTranslate = {'Common': 'Commun', 'Uncommon': 'Peu commun', 'Rare': 'Rare', "Ultra-rare": "Ultra rare"};

openModalBtn.addEventListener('click', ev => {
    modal.style.display = 'block';
});

closeModalBtn.addEventListener('click', ev => {
   modal.style.display = 'none';
});

[hemisphereNorthBtn, hemisphereSouthBtn].forEach(item => {
    item.addEventListener('click', ev => {
        if (hemisphereCurrent.dataset.id !== item.dataset.id) {
            hemisphereCurrent.classList.remove('hemisphere-selected');
            if (hemisphereCurrent === hemisphereNorthBtn) {
                hemisphereSouthBtn.classList.add('hemisphere-selected');
                hemisphereCurrent = hemisphereSouthBtn;
                hemisphereNorthIco.classList.add('hidden');
                hemisphereSouthIco.classList.remove('hidden');
                // UPDATE SETTINGS
                updateHemisphere('s')
            } else {
                hemisphereNorthBtn.classList.add('hemisphere-selected')
                hemisphereCurrent = hemisphereNorthBtn;
                hemisphereSouthIco.classList.add('hidden');
                hemisphereNorthIco.classList.remove('hidden');
                updateHemisphere('n')
            }
            let toast = document.getElementById('toast-modal');
            toast.className = 'show';
            setTimeout(function () {
                toast.classList.remove('show');
            }, 4500);
            displayList(url + currentFilter + '/');
        }
    });
});

[bugsBtn, fishBtn, seaBtn].forEach(item => {
    item.addEventListener('click', ev => {
        let current = document.getElementsByClassName('filter__current')[0];
        switchCurrent(item, current);
        displayList(url + item.dataset.id + '/');
    });
});

function switchCurrent(item, current) {
    current.classList.remove('filter__current');
    item.classList.add('filter__current');
    currentFilter = item.dataset.id;
}

function updateHemisphere(hemisphere) {
    const hemisphereIco = document.getElementById('hemisphere-icon');
    const hemisphereText = document.getElementById('hemisphere');
    if (hemisphere === 's') {
        settings['hemisphere'] = 'Sud';
        hemisphereIco.src = 'img/icon-south.png';
        hemisphereText.textContent = 'Sud';
    } else {
        settings['hemisphere'] = 'Nord';
        hemisphereIco.src = 'img/icon-north.png';
        hemisphereText.textContent = 'Nord';
    }
}

function status(response) {
    if (response.status == 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function json(response) {
    return response.json();
}

function getAll(data) {
    let counter = Object.keys(data).length;
    let keys = Object.keys(data);
    for (let i = 0; i < counter; i++) {
        let m = settings['month'] + 1;
        let h = settings['hemisphere'];
        let t = settings['hour'];
        let item = data[keys[i]];
        let monthArray = item['availability'][(h === 'Nord' ? "month-array-northern" : "month-array-southern")];
        let timeArray = item['availability']['time-array'];

        let name = item['name']['name-EUfr'];
        let ico = item['icon_uri'];
        let rarity = item['availability']['rarity'];


        let price = item['price'];

        if (monthArray.includes(m) && timeArray.includes(t)) {
            createItem(ico, name, (rarity === undefined ? null : rarity), price);
        }
    }
}

function createItem(icon, name, rarity, price) {
    let list = document.getElementsByClassName("list-view")[0];
    let item = document.createElement('div');
    item.classList.add('list__item');
    let headerItem = document.createElement("header");
    headerItem.classList.add("list__header");
    let rarityText = document.createElement("p");
    let priceText = document.createElement("p");
    rarityText.classList.add('rarity');
    priceText.classList.add('price');
    let itemImgDiv = document.createElement('div');
    let ico = document.createElement('img');
    itemImgDiv.classList.add('list__item__img');
    let nameDiv = document.createElement('div');
    let nameText =document.createElement('p');
    nameDiv.classList.add('list__item__details');
    nameText.classList.add('name');


    rarityText.textContent = rarityTranslate[rarity];
    priceText.textContent = price;
    ico.src = icon;
    ico.alt = 'logo ' + name;
    nameText.textContent = name;


    if (rarity != undefined) {
        headerItem.appendChild(rarityText);
    }
    headerItem.appendChild(priceText);
    itemImgDiv.appendChild(ico);
    nameDiv.appendChild(nameText);

    item.appendChild(headerItem);
    item.appendChild(itemImgDiv);
    item.appendChild(nameDiv);
    list.appendChild(item);
}

function clean() {
    let list = document.getElementsByClassName("list-view")[0];
    list.textContent = '';
}

function displayList(url) {
    fetch(url)
        .then(status)
        .then(json)
        .then(function (data) {
            clean();
            getAll(data);
        }).catch(function (error) {
        console.log(error);
    })
}

window.addEventListener('DOMContentLoaded', evt => {
    let hourText = document.getElementById('hour');
    let monthText = document.getElementById('month');
    let hemisphereText = document.getElementById('hemisphere');
    let monthIco = document.getElementById('month-icon');

    hourText.textContent = settings['hour'] + ':' + (settings['minutes'] < 10 ? '0' : '') + settings['minutes'];
    monthText.textContent = months[settings['month']];
    hemisphereText.textContent = settings['hemisphere'];
    monthIco.src = 'img/seasons/' + settings['month'] + '.png';

    displayList(url + currentFilter + '/');
});