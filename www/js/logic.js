const server_domain = "elsa.alexc.ovh";
const pages = ["accueil", "login", "create", "app"];
//const stylesheets = ["css/app.css", "css/app.css", "css/app.css", "css/app.css"];
const onLoads = [onLoadAccueil, onLoadLogin, onLoadCreate, onLoadApp];
const onLeaves = [onLeaveAccueil, onLeaveLogin, onLeaveCreate, onLeaveApp];

const green = '#28a745';
const red = '#dc3545';
const blue = '#004085';
const gray = '#ced4da';

let page_state = 'accueil';
let api_key = null;
let nav_state = true;

let debugObj;
let similCity;
let similarity;

let sliders = {};
let sliders_labels = {};
let sliders_values = {};

// map object in webpage
let mapObject = null;
// code insee to region code for highcharts
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

// default map data
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
// default map properties
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
        minColor: gray,
        maxColor: blue,
        style: {
            color: 'white'
        }
    },
    series: [{
        data: mapData,
        color: blue,
        states: {
            hover: {
                color: green
            }
        },
        dataLabels: {
            enabled: true,
            format: '{point.name}'
        }
    }]
};


// list of loaded cities codes and names
let cities = [];
// list of cities names
let cities_name = [];

let nameToINSEE = {};
// list of departements codes and names
let departements = [];
// list of regions codes and names
let regions = [];
let regionCodeToNames = {};

//graphics and charts data
let boite = []; //data for boite a moustaches

let lineYears = []; // data for line graph
let lineA = []; // data for line graph
let lineB = []; // data for line graph
let lineNames = [];

let actifSal = []; //data for stacked chart
let actifNonSal = []; //data for stacked chart
let chomeur = []; //data for stacked chart

let simA = []; //data for spider charts
let simB = []; //data for spider charts
let citA = []; //data for spider charts
let citB = []; //data for spider charts


//Formating decimals for similarity

var Format = wNumb({
    decimals: 3
});

let communeA = null;
let communeB = null;

let map = null;

// utilitary module for highcharts map
let mapModule = {
    mapReg: mapRegions,
    // update map data series
    updateValues: values => {
        mapObject.series[0].update({
            data: mapData
        });
        mapObject.series[0].update({
            data: values
        });
    }
};

// make an Elsa comparing request in the string json format
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

// idle time before sending comparison request and updating view for diagrams and map
let idle_time_ms = 2000;
// timer variable for clearTimeout and setTimeout
let timer = idle_time_ms;

// triggered when a filter is updated
function filter_update() {
    if (communeA === null || communeA === "" || communeB === null || communeB ===
        "") {
        // can't send request without both cities selected
        console.log("request impossible!");
        refreshButton = document.getElementById("app_refresh");
        refreshButton.setAttribute("disabled", true);
    } else {
        // restart timer
        // update view after a delay
        window.clearTimeout(timer);
        timer = window.setTimeout(filterRequest, idle_time_ms);
    }

}

onLoad();

// executed on script load
function onLoad() {

}

function onLoadAccueil() {
    closeNav();
}

function onLoadLogin() {
    closeNav();
    // get stored user credentials
    const user = localStorage.getItem("user");
    console.log("Stored user data:", user);
    // if stored credentials are present
    if (user != null) {
        userOb = JSON.parse(user);
        // set the connect input box to the stored credentials values
        document.getElementById('login_adresseEmail').value = userOb.email;
        document.getElementById('login_motDePasse').value = userOb.password;

    }
}

function onLoadCreate() {
    closeNav();
}

function onLoadApp() {
    document.getElementById("page_body").classList.add("bg-light");

    // disable filter request button until communes are selected
    refreshButton = document.getElementById("app_refresh");
    refreshButton.setAttribute("disabled", true);
    // highcharts setup
    highcharts_init();

    communeA = document.getElementById('inputCommuneA').value;
    communeB = document.getElementById('inputCommuneB').value;

    openNav();
}

function onLeaveAccueil() {

}

function onLeaveLogin() {

}

function onLeaveCreate() {
    document.getElementById("page_body").classList.remove("bg-dark");
}

function onLeaveApp() {
    closeNav();
}

function onConnect() {

    // preload cities, departements and regions basic info (codes and names)
    console.log("requesting regions...");
    elsaRequest('{"type":"getRegions"}', resp => {
        regions = JSON.parse(resp);
        console.log("got regions");
        for (const reg of regions) {
            regionCodeToNames[reg.num] = reg;
        }
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
                // add cities names to the datalist so it show up when typing
                // in commune search boxes
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

        // update comparator in case chere commune A and B are already set
        onModifA();
        onModifB();
    });

    console.log("Init sliders ...");
    // initialize all noUiSliders for filters
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
        filter_update();
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
        filter_update();
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
        filter_update();
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
        filter_update();
    });
}
/*
    --- Elsa CODE ---
*/
// attempt a connection to ELSA
// if it succeeds, proceeds to the app
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
        } else if (xhr.readyState === 4) {
            console.log("Failed to connect to server");
            alert("Failed to connect to server");
        }
    };
    xhr.send(body);
}

// try to log in from login page
function login_Connecter() {
    let mail = document.getElementById('login_adresseEmail').value;

    let pass = document.getElementById('login_motDePasse').value;
    elsa_Connection(mail, pass);
}

// try to register new account on ELSA server
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
        document.getElementById('create_adresseEmail').style.borderColor = red;
        valid = false;
    } else {
        document.getElementById('create_adresseEmail').style.borderColor =
            green;
    }
    if (user.prenom.length === 0) {
        document.getElementById('create_prenom').style.borderColor = green;
        valid = false;
    } else {
        document.getElementById('create_prenom').style.borderColor = green;
    }
    if (user.nom.length === 0) {
        document.getElementById('create_nom').style.borderColor = red;
        valid = false;
    } else {
        document.getElementById('create_nom').style.borderColor = green;
    }
    if (mdp === mdp2 && mdp.length > 3) {
        document.getElementById('create_motDePasse').style.borderColor = green;
        document.getElementById('create_confirmerMotDePasse').style.borderColor =
            green;
    } else {
        valid = false;
        document.getElementById('create_motDePasse').style.borderColor = red;
        document.getElementById('create_confirmerMotDePasse').style.borderColor =
            red;
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
                } else {
                    const errfield = document.getElementById("create_error");
                    errfield.innerHTML = "Le compte existe Déjà !";
                }
            }
        }
        const url = 'http://' + server_domain + '/create';
        xhr.open('POST', url);
        xhr.onreadystatechange = callback;
        xhr.send(json);
    } else {
        const errfield = document.getElementById("create_error");
        errfield.innerHTML = "Tous les champs ne sont pas remplis.";
    }
}

function helpers_get(id) {
    return document.getElementById(id).value;
}


function elsaRequest(body, callback, errorCallback) {
    // construct server url for API request
    const url = "http://" + server_domain + "/api?key=" + api_key;
    let xhr = new XMLHttpRequest();

    // modify callback to be executed when request completes
    function internCallback() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            callback(xhr.responseText);
        }
        // if request fails (eg: network error)
        else if (xhr.readyState === 4 && typeof errorCallback !== 'undefined') {
            errorCallback(xhr.responseText, xhr.status);
        }
    }
    xhr.open('POST', url);
    // function to be called on state change
    xhr.onreadystatechange = internCallback;
    // send request
    xhr.send(body);
}

// create a list of 2 strings for intervals in the correct format
function intervalStringifier(attr, lb, gb) {
    return [attr + ">=" + lb.toString(), attr + "<=" + gb.toString()];
}

// gather all needed values and send a request for filter/comparison
function filterRequest() {
    let finalFilters = [];

    // get slider values
    let lb = sliders_values.pop[0] | 0;
    let gb = sliders_values.pop[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier(
        "population2015",
        lb, gb));

    lb = sliders_values.act[0] | 0;
    gb = sliders_values.act[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier(
        "actifs2015", lb,
        gb));

    lb = sliders_values.etu[0] | 0;
    gb = sliders_values.etu[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier("etudiants",
        lb,
        gb));

    lb = sliders_values.eta[0] | 0;
    gb = sliders_values.eta[1] | 0;
    finalFilters.push.apply(finalFilters, intervalStringifier(
        "etablissements",
        lb, gb));

    // get all radio checked buttons for mobility
    let radios = document.querySelectorAll('input[name="mobility"]:checked');
    // take the first (should be one and only one radio button checked)
    let value = radios.length > 0 ? radios[0].id.toLowerCase() :
        "anymobility"; // fallback to anymobility if there is a problem
    if (value === "anymobility") {

    } else if (value === "populationsedentaire") {
        finalFilters.push("fidelite=" + "'Pop Sédentaire'");
    } else if (value === "populationmobile") {
        finalFilters.push("fidelite=" + "'Pop Mobile'");
    }

    // gather selected option for demographic_environment in the dropdown list
    let optionList = document.getElementById("demographic_environment").options;
    value = [].slice.call(optionList)
        .filter(x => x.selected === true)[0];

    if (optionList[0].selected === false) {
        finalFilters.push("env_demo=" + "'" + value.innerHTML + "'");
    }

    // create json string request body to be sent
    let jsonReq = mkCompareWithFilters(nameToINSEE[communeA],
        nameToINSEE[communeB],
        finalFilters);

    // send and use the callback
    elsaRequest(jsonReq,
        rep => {
            repOb = JSON.parse(rep);

            // update map with region results
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

            lineNames[0] = repOb.cityA.nom;
            lineNames[1] = repOb.cityB.nom;

            actifSal[0] = repOb.cityA.nb_actifs_sal_2015;
            actifSal[1] = repOb.cityB.nb_actifs_sal_2015;

            actifNonSal[0] = repOb.cityA.nb_actifs_nonSal_2015;
            actifNonSal[1] = repOb.cityB.nb_actifs_nonSal_2015;

            chomeur[0] = repOb.cityA.pop_2015 - repOb.cityA.nb_actifs_2015;
            chomeur[1] = repOb.cityB.pop_2015 - repOb.cityB.nb_actifs_2015;
            
            for(i = 0; i < repOb.withA.length; i ++){
	            simA[i] = ((1-repOb.withA[i].similarity)*100);
	            simB[i] = ((1-repOb.withB[i].similarity)*100);
	            
	            citA[i] = repOb.withA[i].comDepReg.nom;
	            citB[i] = repOb.withB[i].comDepReg.nom;
            }
            
//            console.log(simA[0]);
//            console.log(simA[1]);
//            console.log(simA[2]);
//            console.log(simA[3]);
//            console.log(simA[4]);
//            console.log(simB[0]);
//            console.log(simB[1]);
//            console.log(simB[2]);
//            console.log(simB[3]);
//            console.log(simB[4]);
//            console.log(citA[0]);
//            console.log(citA[1]);
//            console.log(citA[2]);
//            console.log(citA[3]);
//            console.log(citA[4]);
//            console.log(citB[0]);
//            console.log(citB[1]);
//            console.log(citB[2]);
//            console.log(citB[3]);
//            console.log(citB[4]);
//            console.log("salA : " + actifSal[0]);
//            console.log("salB : " + actifSal[1]);
//            console.log("nonsalA : " + actifNonSal[0]);
//            console.log("nonsalB : " + actifNonSal[1]);
//            console.log("chomA : " + chomeur[0]);
//            console.log("chomB : " + chomeur[1]);

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

    closeNav();
}

/*
    --- HIGHCHARTS Init CODE
 */
function highcharts_init() {

    mapObject = Highcharts.mapChart('map', mapProperties);

    let exData = {
        labels: ["January", "February", "March", "April", "May", "June",
            "July"
        ],
        datasets: [{
            label: "My First dataset",
            backgroundColor: red,
            borderColor: red,
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    };
}

function graphs_init() {
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
            categories: [lineYears[0], lineYears[1], lineYears[2],
                lineYears[3]
            ]
        },

        series: [{
            name: lineNames[0],
            data: [lineA[0], lineA[1], lineA[2], lineA[3]]
        }, {
            name: lineNames[1],
            data: [lineB[0], lineB[1], lineB[2], lineB[3]]
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
            text: 'Activité de la population'
        },
        xAxis: {
            categories: [lineNames[0], lineNames[1]]
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Population totale'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) ||
                        'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) ||
                'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) ||
                        'white'
                }
            }
        },
        series: [{
            name: 'Actifs Salariés',
            data: [actifSal[0], actifSal[1]]
        }, {
            name: 'Actifs non Salariés',
            data: [actifNonSal[0], actifNonSal[1]]
        }, {
            name: 'Chomeurs',
            data: [chomeur[0], chomeur[1]]
        }]
    });

    Highcharts.chart('moustache', {

        chart: {
            type: 'boxplot',
            inverted: true
        },

        title: {
            text: 'Statistiques nombre d\'institutions publiques'
        },

        legend: {
            enabled: false
        },

        yAxis: {
            title: {
                text: 'Nombre d\'institutions publics'
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
            data: [
                [boite[0], boite[1], boite[2], boite[3],
                    boite[4]
                ]
            ]
        }]

    });

    //thibaults code goes here
    gaugeOptions = {

        chart: {
            type: 'solidgauge'
        },

        title: {
            text: 'Pourcentage de similarité entre '+lineNames[0]+' et '+lineNames[1]
        },

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) ||
                    '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickAmount: 2,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    // The speed gauge
    Highcharts.chart('gauge', Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Similarité'
            }
        },

        credits: {
            enabled: false
        },

        series: [{
            name: 'Similarité',
            data: [similarity],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) ||
                        'black') + '">{point.y:.2f}</span><br/>' +
                    '<span style="font-size:12px;color:silver">%</span></div>'
            },
            tooltip: {
                valueSuffix: '%',
                
            }
        }]

    }));
    
    Highcharts.chart('spider1', {

        chart: {
            polar: true,
            type: 'line'
        },

        title: {
            text: lineNames[0] + ' : Villes rapprochées',
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: [citA[0], citA[1], citA[2], citA[3],citA[4]],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            valueSuffix: ' %'
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },

        series: [{
            name: 'Similarité',
            data: [simA[0], simA[1], simA[2], simA[3], simA[4]],
            pointPlacement: 'on'
        }]

    });
    
    Highcharts.chart('spider2', {

        chart: {
            polar: true,
            type: 'line'
        },

        title: {
            text: lineNames[1] + ' : Villes similaires',
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: [citB[0], citB[1], citB[2], citB[3],citB[4]],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            valueSuffix: ' %'
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },

        series: [{
            name: 'Similarité',
            data: [simB[0], simB[1], simB[2], simB[3], simB[4]],
            pointPlacement: 'on'
        }]

    });
}

// COMPARATOR CODE

// disable or enable refresh button according to the selected communes
function enableDisableRefreshButton() {
    refreshButton = document.getElementById("app_refresh");
    console.log(communeA + " " + communeB);
    if (communeA !== null && communeB !== null) {
        refreshButton.disabled = false;
    } else {
        refreshButton.disabled = true;
    }
}

// communes search boxes change callbacks
function onModifA() {
    communeA = generic_onModif("inputCommuneA");
    enableDisableRefreshButton();
    update_Comparator();
    filter_update();
}

function onModifB() {
    communeB = generic_onModif("inputCommuneB");
    enableDisableRefreshButton();
    update_Comparator();
    filter_update();
}

function generic_onModif(id) {
    const communneAinput = document.getElementById(id);
    const found = cities_name.find(el => el.trim().toLowerCase() ===
        communneAinput.value.trim().toLowerCase());
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
        function error_callback(resp) {
            console.log("erreur!");
            alert("Une erreur s'est produite sur le serveur!\n" + "erreur " +
                "\n" + resp);
        }

        function cb(data) {
            let ret = JSON.parse(data);
            if (ret.hasOwnProperty("exception") || ret.hasOwnProperty(
                    "error")) {
                console.log("Found an error, defaulting to error callback");
                error_callback(data, 200);
                return;
            }

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

            let container = document.getElementById("comparatorResult");
            let templateContent = document.getElementById(
                "comparatorResultTemplate").content;
            let clone = document.importNode(templateContent, true);

            clone
                .querySelectorAll("[data-if]")
                .forEach(function(e, i, l) {
                    if (!eval("($data) => (" + e.dataset.if+")")(ret)) {
                        e.parentElement.removeChild(e);
                    }
                });

            clone
                .querySelectorAll("[data-attr]")
                .forEach(function(e, i, l) {
                    let attributes = eval("($data) => ({ " + e.dataset.attr +
                        "})")(ret);

                    for (var attr in attributes) {
                        e.setAttribute(attr, attributes[attr]);
                    }
                });

            clone
                .querySelectorAll("[data-content]")
                .forEach(function(e, i, l) {
                    let content = eval("($data) => (" + e.dataset.content +
                        ")");
                    e.innerHTML = content(ret);
                });

            container.innerHTML = "";
            container.appendChild(clone);
            similCity = ret;
            similarity = (1 - similCity.sc) * 100;
            update_city("commA_display", ret['comm1']);
            update_city("commB_display", ret['comm2']);
            
        }

        elsaRequest(JSON.stringify({
            type: 'compareCities',
            commune1: nameToINSEE[communeA],
            commune2: nameToINSEE[communeB]
        }), cb, error_callback)
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

// open side panel
function openNav() {
    document.getElementById("mySidenav").style.width = "25%";
    document.getElementById("app_openNav").style.color = '#ccc';
    nav_state = true;
    document.getElementById("app_side_bottom").hidden = false;
    document.getElementById("app_filters").hidden = false;
}

// close side panel
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("app_openNav").style.color = '#555';
    nav_state = false;
    document.getElementById("app_side_bottom").hidden = true;
    document.getElementById("app_filters").hidden = true;
}

// close panel if open else open
function toggleNav() {
    if (nav_state === true) {
        closeNav();
    } else {
        openNav();
    }
}

/*
    --- Various Utilities ---
 */

// regex to test email validity
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
                "csv": freader.result.replace(/[\r| ]/g, "")
                    .split(
                        "\n")
            }), res => {
                const ans = JSON.parse(res);
                if (ans.hasOwnProperty('status') && ans.status ===
                    "done")
                    alert("Chargement du Fichier Reussi !\n" +
                        ans.errors +
                        " erreurs d'Inserion.");
            });
        };
    }
}

function greenRedColor(cond) {
    return 'color: ' + (cond ? green : red);
}

function disconnect() {
    localStorage.clear();
    window.location.reload();
}
