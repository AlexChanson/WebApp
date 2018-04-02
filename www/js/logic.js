const server_domain = "elsa.alexc.ovh";
const pages = ["acceuil", "login", "create", "app"];
const stylesheets = ["css/clem.css", "css/clem.css", "css/app.css",
    "css/app.css"
];
const onLoads = [onLoadAcceuil, onLoadLogin, onLoadCreate, onLoadApp];
const onLeaves = [onLeaveAcceuil, onLeaveLogin, onLeaveCreate, onLeaveApp];

let page_state = 'acceuil';
let api_key = null;
let nav_state = true;

let sliders = {};
let sliders_labels = {};

let cities = [];
let cities_name = [];
let nameToINSEE = {};
let departements = [];
let regions = [];

let communeA = null;
let communeB = null;

/*
    --- Event CODE ---
*/

onLoad();

function onLoad() {
    const user = localStorage.getItem("user");
    console.log("Stored user data:", user);
    if (user != null) {
        api_key = JSON.parse(user).api;
        swapTo('app');
        onConnect();
    }

}

function onLoadAcceuil() {

}

function onLoadLogin() {

}

function onLoadCreate() {}

function onLoadApp() {
    document.getElementById("page_body").classList.add("bg-light");
}

function onLeaveAcceuil() {

}

function onLeaveLogin() {

}

function onLeaveCreate() {
    document.getElementById("page_body").classList.remove("bg-dark");
}

function onLeaveApp() {}

function onConnect() {
    elsaRequest('{"type":"getRegions"}', resp => {
        regions = JSON.parse(resp);
    });
    elsaRequest('{"type":"getDepartements"}', resp => {
        departements = JSON.parse(resp);
    });
    elsaRequest('{"type":"getCityNames"}', resp => {
        cities = JSON.parse(resp);

        console.log("cities loading in browser...");
        let datalistCommuneA = document.getElementById("listCommunes");
        let child = null;
        for (let jsonCity of cities) {
            const name = jsonCity.nom;
            if (name) {
                child = document.createElement("option");
                child.setAttribute("value", name);
                datalistCommuneA.appendChild(child);
                cities_name.push(name);
            }
            const code = jsonCity.code_insee;
            if (name && code) {
                nameToINSEE[name] = code;
            }
        }
        console.log(cities.length.toString() + " cities loaded.");
        highcharts_init();


    });

    console.log("Init sliders ...");
    sliders["pop"] = document.getElementById('slider-population');
    noUiSlider.create(sliders['pop'], {
        start: [7500, 50000],
        tooltips: [wNumb({
            decimals: 0
        }), wNumb({
            decimals: 0
        })],
        step: 100,
        connect: true,
        range: {
            'min': [0, 10],
            '10%': [500, 100],
            '30%': [5000, 500],
            '75%': [50000, 5000],
            'max': 2500000
        }
    });
    sliders_labels['pop'] = [document.getElementById('sl_pop_min'), document.getElementById(
        'sl_pop_max')];
    sliders['pop'].noUiSlider.on('update', function(values, handle) {
        sliders_labels['pop'][handle].innerHTML = values[handle];
    });

    sliders["etu"] = document.getElementById('slider-etudiants');
    noUiSlider.create(sliders['etu'], {
        start: [0, 50000],
        tooltips: [wNumb({
            decimals: 0
        }), wNumb({
            decimals: 0
        })],
        connect: true,
        range: {
            'min': [0, 10],
            '20%': [5000, 1000],
            '75%': [100000, 10000],
            'max': 1000000
        }
    });
    sliders_labels['etu'] = [document.getElementById('sl_etu_min'), document.getElementById(
        'sl_etu_max')];
    sliders['etu'].noUiSlider.on('update', function(values, handle) {
        sliders_labels['etu'][handle].innerHTML = values[handle];
    });

    sliders["act"] = document.getElementById('slider-actifs');
    noUiSlider.create(sliders['act'], {
        start: [0, 1000000],
        connect: true,
        range: {
            'min': [0, 10],
            '20%': [5000, 1000],
            '75%': [100000, 10000],
            'max': 1000000
        }
    });
    sliders_labels['act'] = [document.getElementById('sl_act_min'), document.getElementById(
        'sl_act_max')];
    sliders['act'].noUiSlider.on('update', function(values, handle) {
        sliders_labels['act'][handle].innerHTML = values[handle];
    });

    sliders["eta"] = document.getElementById('slider-etablissements');
    noUiSlider.create(sliders['eta'], {
        start: [0, 1500],
        connect: true,
        range: {
            'min': [0, 5],
            '25%': [100, 10],
            '50%': [500, 50],
            'max': 1500
        }
    });
    sliders_labels['eta'] = [document.getElementById('sl_eta_min'), document.getElementById(
        'sl_eta_max')];
    sliders['eta'].noUiSlider.on('update', function(values, handle) {
        sliders_labels['eta'][handle].innerHTML = values[handle];
    });
}
/*
    --- Elsa CODE ---
*/
function elsa_Connection(email, password) {
    let xhr = new XMLHttpRequest();
    const url = 'http://' + server_domain + '/connect';
    const body = '{"email":"' + email + '", "password":"' + password + '"}';
    const checkbox = document.getElementById("connectionPersistent");
    xhr.open('POST', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let ret = JSON.parse(xhr.responseText);
            if (ret.hasOwnProperty('api_key')) {
                api_key = ret.api_key;
                if (checkbox.checked) {
                    localStorage.setItem("user", JSON.stringify({
                        email: email,
                        password: password,
                        api: api_key
                    }));
                }
                onConnect();
                swapTo('app');
            }
        }
    };
    xhr.send(body);
}

function login_Connecter() {
    let mail = document.getElementById('login_adresseEmail').value;
    let pass = document.getElementById('login_motDePasse').value;
    elsa_Connection(mail, pass);
}

function create_Submit() {
    let valid = true;
    const mdp = helpers_get('create_motDePasse');
    const mdp2 = helpers_get('create_confirmerMotDePasse');
    const user = {
        email: helpers_get('create_adresseEmail'),
        nom: helpers_get('create_nom'),
        prenom: helpers_get('create_prenom'),
        password: mdp
    };
    if (!validateEmail(user.email)) {
        document.getElementById('create_adresseEmail').style.borderColor =
            "red";
        valid = false;
    } else {
        document.getElementById('create_adresseEmail').style.borderColor =
            "green";
    }
    if (user.prenom.length === 0) {
        document.getElementById('create_prenom').style.borderColor = "red";
        valid = false;
    } else {
        document.getElementById('create_prenom').style.borderColor = "green";
    }
    if (user.nom.length === 0) {
        document.getElementById('create_nom').style.borderColor = "red";
        valid = false;
    } else {
        document.getElementById('create_nom').style.borderColor = "green";
    }
    if (mdp === mdp2 && mdp.length > 3) {
        document.getElementById('create_motDePasse').style.borderColor =
            "green";
        document.getElementById('create_confirmerMotDePasse').style.borderColor =
            "green";
    } else {
        valid = false;
        document.getElementById('create_motDePasse').style.borderColor = "red";
        document.getElementById('create_confirmerMotDePasse').style.borderColor =
            "red";
    }

    if (valid) {
        let json = JSON.stringify(user);
        let xhr = new XMLHttpRequest();

        function callback() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let ret = JSON.parse(xhr.responseText);
                if (ret.hasOwnProperty("api_key")) {
                    elsa_Connection(user.email, user.password);
                }
            }
        }
        const url = 'http://' + server_domain + '/create';
        xhr.open('POST', url);
        xhr.onreadystatechange = callback;
        xhr.send(json);
    }
}

function helpers_get(id) {
    return document.getElementById(id).value;
}

function elsaRequest(body, callback) {
    const url = "http://" + server_domain + "/api?key=" + api_key;
    let xhr = new XMLHttpRequest();

    function internCallback() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            callback(xhr.responseText);
        }
    }
    xhr.open('POST', url);
    xhr.onreadystatechange = internCallback;
    xhr.send(body);
}

/*
    --- HIGHCHARTS Init CODE
 */
function highcharts_init() {
    Highcharts.mapChart('map', {
        title: {
            text: 'Région'
        },
        chart: {
            map: 'countries/fr/fr-all'
        },
        colorAxis: {
            min: 0,
            style: {
                color: '#fff'
            }
        },
        series: [{
            data: [
                ['fr-t', 0],
                ['fr-h', 1],
                ['fr-e', 2],
                ['fr-r', 3],
                ['fr-u', 4],
                ['fr-n', 5],
                ['fr-p', 6],
                ['fr-o', 7],
                ['fr-v', 8],
                ['fr-s', 9],
                ['fr-g', 10],
                ['fr-k', 11],
                ['fr-a', 12],
                ['fr-c', 13],
                ['fr-f', 14],
                ['fr-l', 15],
                ['fr-d', 16],
                ['fr-b', 17],
                ['fr-i', 18],
                ['fr-q', 19],
                ['fr-j', 20],
                ['fr-m', 21],
                ['fr-re', 22],
                ['fr-yt', 23],
                ['fr-gf', 24],
                ['fr-mq', 25],
                ['fr-gp', 26],
                ['undefined', 27]
            ],
            states: {
                hover: {
                    color: '#BADA55'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }]
    });

    let exData = {
        labels: ["January", "February", "March", "April", "May", "June",
            "July"
        ],
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    }

    let ctx1 = $("#chart_1");
    let chart1 = new Chart(ctx1, {
        type: 'radar',
        data: exData,
        options: {}
    });
    let ctx2 = $("#chart_2");
    let chart2 = new Chart(ctx2, {
        type: 'bar',
        data: exData,
        options: {}
    });
    let ctx3 = $("#chart_3");
    let chart3 = new Chart(ctx3, {
        type: 'line',
        data: exData,
        options: {}
    });
}

// COMPARATOR CODE


function onModifA() {
    communeA = generic_onModif("inputCommuneA");
    update_Comparator();
}

function onModifB() {
    communeB = generic_onModif("inputCommuneB");
    update_Comparator();
}

function generic_onModif(id) {
    const communneAinput = document.getElementById(id);
    const found = cities_name.find(el => el === communneAinput.value);
    if (found !== undefined) {
        communneAinput.style.borderColor = '#2aad00';
        return found;
    } else {
        communneAinput.style.borderColor = '#df1d00';
        return null;
    }
}

function update_Comparator() {
    if (communeB != null && communeA != null) {
        function cb(data) {
            function update_city(id, d) {
                let container = document.getElementById(id);
                let templateContent = document.querySelector(
                    "#comparatorDataTemplate").content;
                let elem = templateContent.querySelectorAll("[data-key]");

                elem.forEach(function(e, i, l) {
                    let k = e.dataset.key;

                    if (typeof d[k] !== "undefined") {
                        e.innerHTML = d[k];
                    }
                });

                container.textContent = "";
                container.appendChild(document.importNode(templateContent, true));
            }

            console.log(data);
            let ret = JSON.parse(data);

            update_city("commA_display", ret['comm1']);
            update_city("commB_display", ret['comm2']);
        }
        elsaRequest(JSON.stringify({
            type: 'compareCities',
            commune1: nameToINSEE[communeA],
            commune2: nameToINSEE[communeB]
        }), cb)
    }
}

/*
    --- Virtual Page / Side Menu LOGIC ---
 */
function swapTo(nom) {
    console.log("Switched to: " + nom);
    for (let i = 0; i < pages.length; i++) {
        if (pages[i] === page_state)
            onLeaves[i]();
    }
    for (let i = 0; i < pages.length; i++) {
        if (pages[i] !== nom) {
            document.getElementById(pages[i]).hidden = true;
        } else {
            document.getElementById(pages[i]).hidden = false;
            document.getElementById('dynamic_css').setAttribute('href',
                stylesheets[i]);
            page_state = nom;
            onLoads[i]();
        }
    }
}

function toggleNav() {
    if (nav_state === true) {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("app_openNav").style.color = '#555';
        nav_state = false;
        document.getElementById("app_side_bottom").hidden = true;
        document.getElementById("app_filters").hidden = true;
    } else {
        document.getElementById("mySidenav").style.width = "25%";
        document.getElementById("app_openNav").style.color = '#ccc';
        nav_state = true;
        document.getElementById("app_side_bottom").hidden = false;
        document.getElementById("app_filters").hidden = false;
    }
}

/*
    --- Various Utilities ---
 */

function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
        return true;
    return false;
}
