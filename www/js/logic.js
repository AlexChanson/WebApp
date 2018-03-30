const server_domain = "elsa.alexc.ovh";
const pages = ["acceuil", "login", "create", "app"];
const stylesheets = ["css/clem.css", "css/clem.css", "css/clem.css",
    "css/app.css"
];
const onLoads = [onLoadAcceuil, onLoadLogin, onLoadCreate, onLoadApp];
const onLeaves = [onLeaveAcceuil, onLeaveLogin, onLeaveCreate, onLeaveApp];

let page_state = 'acceuil';
let api_key = null;
let nav_state = true;

let cities = [];
let departements = [];
let regions = [];

const getRegionsJSON = '{"type":"getRegions"}';
const getCityNamesJSON = '{"type":"getCityNames"}';
const getDepartementsJSON = '{"type":"getDepartements"}';


class VirtualPage {
    constructor(name, stylesheet, onL, onD) {
        this.name = name;
        this.stylesheet = stylesheet;
        this.onL = onL;
        this.onD = onD;
    }

    load(){
        document.getElementById(this.name).hidden = false;
        document.getElementById('dynamic_css').setAttribute('href', this.stylesheet);
        this.onL();
    }

    unload(){
        document.getElementById(this.name).hidden = true;
        this.onD();
    }
}

class VirtualPageManager{
    constructor(defaultPage){
        this.pages = new Map();
        this.pages.set(defaultPage.name, defaultPage);
        defaultPage.load();
    }

    registerPage(vPage){
        this.pages.set(vPage.name, vPage);
    }

    swapTo(name){
        const target = this.pages.get(name);
        this.pages.forEach(function (key, value) {
            if(value.name !== target.name)
                value.unload();
        });
        target.load();
    }
}


onLoad();

function onLoad() {
    const user = localStorage.getItem("user");
    console.log(user);
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

function onLoadCreate() {

}

function onLoadApp() {
    document.getElementById("page_body").classList.add("bg-light");
    let slider1 = document.getElementById('app_slider_1');
    noUiSlider.create(slider1, {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });
}

function onLeaveAcceuil() {

}

function onLeaveLogin() {

}

function onLeaveCreate() {

}

function onLeaveApp() {
    document.getElementById("page_body").classList.remove("bg-light");
}

function onConnect() {
    elsaRequest(getRegionsJSON, resp => {
        regions = JSON.parse(resp);
    });
    elsaRequest(getDepartementsJSON, resp => {
        departements = JSON.parse(resp);
    });
    elsaRequest(getCityNamesJSON, resp => {
        cities = JSON.parse(resp);

        console.log("cities loading in browser...");
        let datalistCommuneA = document.getElementById("listCommunes");
        let child = null;
        for (jsonCity of cities) {
            const name = jsonCity.nom;
            if (name) {
                child = document.createElement("option");
                child.setAttribute("value", name);
                datalistCommuneA.appendChild(child);
            }
        }
        console.log(cities.length.toString() + " cities loaded.");

    });

}


function swapTo(nom) {
    console.log("Switched to: " + nom);
    for (let i = 0; i < pages.length; i++){
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
    } else {
        document.getElementById("mySidenav").style.width = "25%";
        document.getElementById("app_openNav").style.color = '#ccc';
        nav_state = true;
    }
}


function elsa_Connection(email, password) {
    let xhr = new XMLHttpRequest();
    const url = 'http://elsa.alexc.ovh/connect';
    const body = '{"email":"' + email + '", "password":"' + password + '"}';
    xhr.open('POST', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let ret = JSON.parse(xhr.responseText);
            if (ret.hasOwnProperty('api_key')) {
                api_key = ret.api_key;
                swapTo('app');
                if (document.getElementById("connectionPersistent").checked)
                    localStorage.setItem("user", JSON.stringify({
                        email: email,
                        password: password,
                        api: api_key
                    }));
                onConnect();
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
    const mdp = helpers_get('create_motDePasse');
    const mdp2 = helpers_get('create_confirmerMotDePasse');
    const user = {
        email: helpers_get('create_adresseEmail'),
        nom: helpers_get('create_nom'),
        prenom: helpers_get('create_prenom'),
        password: mdp
    };
    //console.log(user);
    if (mdp === mdp2) {
        let json = JSON.stringify(user);
        let xhr = new XMLHttpRequest();

        function callback() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let ret = JSON.parse(xhr.responseText);
                //console.log(ret);
                if (ret.hasOwnProperty("api_key")){
                    elsa_Connection(user.email, user.password);
                }
            }
        }
        const url = 'http://' + server_domain + '/create';
        xhr.open('POST', url);
        xhr.onreadystatechange = callback;
        xhr.send(json);
    } else {
        document.getElementById('create_mdpZone2').style.color = "red";
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
