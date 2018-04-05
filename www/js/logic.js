const server_domain = "elsa.alexc.ovh";
const pages = ["accueil", "login", "create", "app"];
//const stylesheets = ["css/app.css", "css/app.css", "css/app.css", "css/app.css"];
const onLoads = [onLoadAccueil, onLoadLogin, onLoadCreate, onLoadApp];
const onLeaves = [onLeaveAccueil, onLeaveLogin, onLeaveCreate, onLeaveApp];

let page_state = 'accueil';
let api_key = null;
let nav_state = true;

let debugObj;

let sliders = {};
let sliders_labels = {};
let sliders_values = {};

let mapObject = null;
let mapRegions = {
    1: 'fr-gp',
    2: 'fr-mq',
    3: 'fr-gf',
    4: 'fr-re',
    11: 'fr-j',
    21: 'fr-g',
    22: 'fr-s',
    23: 'fr-q',
    24: 'fr-f',
    25: 'fr-p',
    26: 'fr-d',
    31: 'fr-o',
    41: 'fr-m',
    42: 'fr-a',
    43: 'fr-i',
    52: 'fr-r',
    53: 'fr-e',
    54: 'fr-t',
    72: 'fr-b',
    73: 'fr-n',
    74: 'fr-l',
    82: 'fr-v',
    83: 'fr-c',
    91: 'fr-k',
    93: 'fr-u',
    94: 'fr-h'
};
let mapData = [
    ['fr-t', 0],
    ['fr-h', 0],
    ['fr-e', 0],
    ['fr-r', 0],
    ['fr-u', 0],
    ['fr-n', 0],
    ['fr-p', 0],
    ['fr-o', 0],
    ['fr-v', 0],
    ['fr-s', 0],
    ['fr-g', 0],
    ['fr-k', 0],
    ['fr-a', 0],
    ['fr-c', 0],
    ['fr-f', 0],
    ['fr-l', 0],
    ['fr-d', 0],
    ['fr-b', 0],
    ['fr-i', 0],
    ['fr-q', 0],
    ['fr-j', 0],
    ['fr-m', 0],
    ['fr-re', 0],
    ['fr-yt', 0],
    ['fr-gf', 0],
    ['fr-mq', 0],
    ['fr-gp', 0],
    ['undefined', 0]
];
let mapProperties = {
    title: {
        text: 'Résultats par régions'
    },
    chart: {
        map: 'countries/fr/fr-all',
        backgroundColor: 'transparent'
    },
    colorAxis: {
        min: 0,
        style: {
            color: '#fff'
        }
    },
    series: [{
        data: mapData,
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
};



let cities = [];
let cities_name = [];
let nameToINSEE = {};
let departements = [];
let regions = [];
let chartData = [];

//graphics and charts data
let boite = []; //data for boite a moustaches 
let lineYears = []; // data for line graph
let lineA = [];
let lineB = [];

let simCitiesA = []
let simCitiesB = []

let communeA = null;
let communeB = null;

let map = null;

let mapModule = {
    mapReg: mapRegions,
    updateValues: values => {
        mapObject.series[0].update({
            data: mapData
        });
        mapObject.series[0].update({
            data: values
        });
    }
}

function mkCompareWithFilters(comA, comB, filters) {
    return JSON.stringify({
        type: "compareCitiesWithSelected",
        commune1: comA,
        commune2: comB,
        filters: filters
    })
}

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
    highcharts_init();
}

function onLoadAccueil() {

}

function onLoadLogin() {

}

function onLoadCreate() {}

function onLoadApp() {
    document.getElementById("page_body").classList.add("bg-light");
    refreshButton = document.getElementById("app_refresh");
    refreshButton.setAttribute("disabled", true);
}

function onLeaveAccueil() {

}

function onLeaveLogin() {

}

function onLeaveCreate() {
    document.getElementById("page_body").classList.remove("bg-dark");
}

function onLeaveApp() {}

function onConnect() {
    console.log("requesting regions...");
    elsaRequest('{"type":"getRegions"}', resp => {
        regions = JSON.parse(resp);
        console.log("got regions");
    });

   
    
    console.log("requesting departments...");
    elsaRequest('{"type":"getDepartements"}', resp => {
        departements = JSON.parse(resp);
        console.log("got departments...");
    });
    console.log("requesting cities names...");
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
        sliders_values['pop'] = values;
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
        sliders_values['etu'] = values;
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
        sliders_values['act'] = values;
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
        sliders_values['eta'] = values;
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
    console.log(valid);
    if (valid) {
        let json = JSON.stringify(user);
        let xhr = new XMLHttpRequest();

        function callback() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let ret = JSON.parse(xhr.responseText);
                if (ret.hasOwnProperty("api_key")) {
                    elsa_Connection(user.email, user.password);
                }else {
                    const errfield = document.getElementById("create_error");
                    errfield.innerHTML = "Le compte existe Déjà !";
                }
            }
        }
        const url = 'http://' + server_domain + '/create';
        xhr.open('POST', url);
        xhr.onreadystatechange = callback;
        xhr.send(json);
    } else  {
        const errfield = document.getElementById("create_error");
        errfield.innerHTML = "Tous les champs ne sont pas remplis.";
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

function intervalStringifier(attr, lb, gb) {
    return [attr + ">=" + lb.toString(), attr + "<=" + gb.toString()];
}

function filterRequest() {
    let finalFilters = [];
    let lb = sliders_values.pop[0] | 0;
    let gb = sliders_values.pop[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier("population2015",
        lb, gb));

    lb = sliders_values.act[0] | 0;
    gb = sliders_values.act[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier(
        "actifs2015", lb,
        gb));

    lb = sliders_values.etu[0] | 0;
    gb = sliders_values.etu[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier("etudiants", lb,
        gb));

    lb = sliders_values.eta[0] | 0;
    gb = sliders_values.eta[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier("etablissements",
        lb, gb));

    let radios = document.querySelectorAll('input[name="mobility"]:checked');
    let value = radios.length > 0 ? radios[0].id.toLowerCase() : "anymobility";
    if (value === "anymobility") {

    } else if (value === "populationsedentaire") {
        finalFilters.push("fidelite=" + "'Pop Sédentaire'");
    } else if (value === "populationmobile") {
        finalFilters.push("fidelite=" + "'Pop Mobile'");
    }

    let optionList = document.getElementById("demographic_environment").options;
    value = [].slice.call(optionList)
        .filter(x => x.selected === true)[0];

    if (optionList[0].selected === false) {
        finalFilters.push("env_demo=" + "'" + value.innerHTML + "'");
    }

    console.log(finalFilters);

    let jsonReq = mkCompareWithFilters(nameToINSEE[communeA],
        nameToINSEE[communeB],
        finalFilters);

    elsaRequest(jsonReq,
        rep => {
            repOb = JSON.parse(rep);

            newValues = Object.entries(repOb.countByRegion).map(x => [
                mapRegions[x[0]], x[1]
            ]);
            
            mapModule.updateValues(newValues);
            
            debugObj = repOb;
            
            //MCM
            boite[0] = repOb.min_nb_inst_pub;
            boite[1] = repOb.quantileValues[0];
            boite[2] = repOb.quantileValues[1];
            boite[3] = repOb.quantileValues[2];
            boite[4] = repOb.max_nb_inst_pub;
            
            lineYears[0] = repOb.userCommunesA[0].ANNEE;
            lineYears[1] = repOb.userCommunesA[1].ANNEE;
            lineYears[2] = repOb.userCommunesA[2].ANNEE;
            lineYears[3] = 2015;
            
            lineA[0] = repOb.userCommunesA[0].POPULATION;
            lineA[1] = repOb.userCommunesA[1].POPULATION;
            lineA[2] = repOb.userCommunesA[2].POPULATION;
            lineA[3] = repOb.cityA.pop_2015;
            
            lineB[0] = repOb.userCommunesB[0].POPULATION;
            lineB[1] = repOb.userCommunesB[1].POPULATION;
            lineB[2] = repOb.userCommunesB[2].POPULATION;
            lineB[3] = repOb.cityB.pop_2015;
            
            
//            console.log("a1 : " + lineA[0]);
//            console.log("a2 : " + lineA[1]);
//            console.log("a3 : " + lineA[2]);
//            console.log("a4 : " + lineA[3]);
//            
//            console.log("b1 : " + lineB[0]);
//            console.log("b2 : " + lineB[1]);
//            console.log("b3 : " + lineB[2]);
//            console.log("b4 : " + lineB[3]);
            
//            console.log("min : " + boite[0]);
//            console.log("q1 : " + boite[1]);
//            console.log("q2 : " + boite[2]);
//            console.log("q3 : " + boite[3]);
//            console.log("max : " + boite[4]);            
//            console.log("test similarity : " + repOb.withA[0].similarity);
//            
            graphs_init();
        });

}

/*
    --- HIGHCHARTS Init CODE
 */
function highcharts_init() {

    mapObject = Highcharts.mapChart('map', mapProperties);

}

function graphs_init(){
	Highcharts.chart('lineg', {

        title: {
            text: 'Evolution des populations, 2003 - 2015'
        },

        yAxis: {
            title: {
                text: 'Nombre d\'habitants'
            }
        },
        
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                }
            }
        },

    	xAxis: {
      	      categories: [lineYears[0],lineYears[1],lineYears[2],lineYears[3]]},

        series: [{
            name: 'Commune A',
            data: [lineA[0],lineA[1],lineA[2],lineA[3]]
        }, {
            name: 'Commune B',
            data: [lineB[0],lineB[1],lineB[2],lineB[3]]
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
    
    Highcharts.chart('bar', {

        chart: {
            type: 'column'
        },

        title: {
            text: 'Activité de la population, année X - année Y'
        },

        xAxis: {
            categories: ['Commune 1', 'Commune 2']
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: 'Nombre dhabitants'
            }
        },

        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },

        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },

        series: [{
            name: 'ActifsX',
            data: [59408, 33456],
            stack: 'male'
        }, {
            name: 'ChomeursX',
            data: [33455, 44355],
            stack: 'male'
        }, {
            name: 'ActifsY',
            data: [20345, 5564],
            stack: 'female'
        }, {
            name: 'ChomeursY',
            data: [33453, 34555],
            stack: 'female'
        }]
    });
    
    Highcharts.chart('moustache', {

        chart: {
            type: 'boxplot',
            inverted : true
        },

        title: {
            text: 'Statistiques nombre dinstitutions publics'
        },

        legend: {
            enabled: false
        },

        yAxis: {
            title: {
                text: 'Nombre dinstitutions publics'
            },
            
        },

        plotOptions: {
            boxplot: {
                lineWidth: 2,
                medianWidth: 3,
                stemWidth: 1,
                whiskerLength: '20%',
                whiskerWidth: 3
            }
        },

        series: [{
            name: 'Observations',
            data: [[boite[0],boite[1],boite[2],boite[3],boite[4]]]
        }]

    });
}

// COMPARATOR CODE

function enableDisableRefreshButton() {
    refreshButton = document.getElementById("app_refresh");
    console.log(communeA + " " + communeB);
    if (communeA !== null && communeB !== null) {
        refreshButton.disabled = false;
    } else {
        refreshButton.disabled = true;
    }
}

function onModifA() {
    communeA = generic_onModif("inputCommuneA");
    enableDisableRefreshButton();
    update_Comparator();
}

function onModifB() {
    communeB = generic_onModif("inputCommuneB");
    enableDisableRefreshButton();
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
                container.appendChild(document.importNode(templateContent,
                    true));
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
            //document.getElementById('dynamic_css').setAttribute('href',stylesheets[i]);
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

function updateMap() {
    mapObject.update(mapProperties);
}

function browseCsvFile() {
    document.getElementById("csv_file_input").click();
}

function loadCsv() {
    let input = document.getElementById("csv_file_input");
    let files = input.files;

    if (files.length > 0) {
        let freader = new FileReader();
        freader.readAsText(files[0]);

        freader.onload = function() {
            elsaRequest(JSON.stringify({
                "type": "loadCSV",
                "csv": freader.result.replace(/[\r| ]/g, "").split(
                    "\n")
            }), res => {
                const ans = JSON.parse(res);
                if (ans.hasOwnProperty('status') && ans.status ===
                    "done")
                    alert("Chargement du Fichier Reussi !\n" + ans.errors +
                        " erreurs d'Inserion.");
            });
        };
    }
}
