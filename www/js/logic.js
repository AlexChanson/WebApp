const server_domain = "elsa.alexc.ovh";
const pages = ["acceuil", "login", "create", "app"];
const stylesheets = ["css/clem.css", "css/clem.css", "css/clem.css", "css/app.css"];
const onLoads = [onLoadAcceuil, onLoadLogin, onLoadCreate, onLoadApp];
const onLeaves = [onLeaveAcceuil, onLeaveLogin, onLeaveCreate, onLeaveApp];

let page_state = 'acceuil';
let api_key = null;
let nav_state = true;

let sliders = {};

let cities = [];
let cities_name = [];
let nameToINSEE = {};
let departements = [];
let regions = [];

let communeA = null; let communeB = null;

/*
    --- Event CODE ---
*/

onLoad();

function onLoad() {
    const user = localStorage.getItem("user");
    console.log("Stored user data:",user);
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
            if (name && code){
                nameToINSEE[name] = code;
            }
        }
        console.log(cities.length.toString() + " cities loaded.");

    });

    console.log("Init sliders ...");
    sliders["pop"] = document.getElementById('slider-population');
    noUiSlider.create(sliders['pop'], {
        start: [7500, 50000],
        tooltips:[wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
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
    let popValues = [document.getElementById('sl_pop_min'), document.getElementById('sl_pop_max')];
    sliders['pop'].noUiSlider.on('update', function( values, handle ) {
        popValues[handle].innerHTML = values[handle];
    });

    sliders["etu"] = document.getElementById('slider-etudiants');
    noUiSlider.create(sliders['etu'], {
        start: [0, 1000000],
        tooltips:[wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
        connect: true,
        range: {
            'min': [0, 10],
            '20%': [5000, 1000],
            '75%': [100000, 10000],
            'max': 1000000
        }
    });

    sliders["act"] = document.getElementById('slider-actifs');
    noUiSlider.create(sliders['act'], {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });

    sliders["eta"] = document.getElementById('slider-etablissements');
    noUiSlider.create(sliders['eta'], {
        start: [20, 80],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });
}
/*
    --- Elsa CODE ---
*/
function elsa_Connection(email, password) {
    let xhr = new XMLHttpRequest();
    const url = 'http://'+server_domain+'/connect';
    const body = '{"email":"' + email + '", "password":"' + password + '"}';
    const checkbox = document.getElementById("connectionPersistent");
    xhr.open('POST', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let ret = JSON.parse(xhr.responseText);
            if (ret.hasOwnProperty('api_key')) {
                api_key = ret.api_key;
                if (checkbox.checked){
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
    const mdp = helpers_get('create_motDePasse');
    const mdp2 = helpers_get('create_confirmerMotDePasse');
    const user = {
        email: helpers_get('create_adresseEmail'),
        nom: helpers_get('create_nom'),
        prenom: helpers_get('create_prenom'),
        password: mdp
    };
    if (mdp === mdp2) {
        let json = JSON.stringify(user);
        let xhr = new XMLHttpRequest();

        function callback() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let ret = JSON.parse(xhr.responseText);
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

// highcharts
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
        data: [['fr-t', 0], ['fr-h', 1], ['fr-e', 2], ['fr-r', 3], ['fr-u', 4], ['fr-n', 5], ['fr-p', 6], ['fr-o', 7], ['fr-v', 8], ['fr-s', 9], ['fr-g', 10], ['fr-k', 11], ['fr-a', 12], ['fr-c', 13], ['fr-f', 14], ['fr-l', 15], ['fr-d', 16], ['fr-b', 17], ['fr-i', 18], ['fr-q', 19], ['fr-j', 20], ['fr-m', 21], ['fr-re', 22], ['fr-yt', 23], ['fr-gf', 24], ['fr-mq', 25], ['fr-gp', 26], ['undefined', 27]],
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

Highcharts.chart('populationBreakdownChart', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Browser market shares in January, 2018'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
            }
        }
    },
    series: [{
        name: 'Brands',
        colorByPoint: true,
        data: [{
            name: 'Chrome',
            y: 61.41,
            sliced: true,
            selected: true
        }, {
            name: 'Internet Explorer',
            y: 11.84
        }, {
            name: 'Firefox',
            y: 10.85
        }, {
            name: 'Edge',
            y: 4.67
        }, {
            name: 'Safari',
            y: 4.18
        }, {
            name: 'Sogou Explorer',
            y: 1.64
        }, {
            name: 'Opera',
            y: 1.6
        }, {
            name: 'QQ',
            y: 1.2
        }, {
            name: 'Other',
            y: 2.61
        }]
    }]
});

Highcharts.chart('populationChangeChart', {
    title: {
        text: 'Solar Employment Growth by Sector, 2010-2016'
    },
    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },
    yAxis: {
        title: {
            text: 'Number of Employees'
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
        },
            pointStart: 2010
        }
    },
    series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
        name: 'Sales & Distribution',
        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
        name: 'Project Development',
        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
        name: 'Other',
        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
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
    const found = cities_name.find( el => el === communneAinput.value);
    if (found !== undefined){
        communneAinput.style.borderColor = '#2aad00';
        return found;
    } else {
        communneAinput.style.borderColor = '#df1d00';
        return null;
    }
}

function update_Comparator() {
    if (communeB != null && communeA != null){
        function cb(data){
            console.log(data);
            let ret = JSON.parse(data);
            document.getElementById("commA_display").innerHTML = JSON.stringify(ret["comm1"]);
            document.getElementById("commB_display").innerHTML = JSON.stringify(ret["comm2"]);
        }
        elsaRequest(JSON.stringify({type:'compareCities', commune1:nameToINSEE[communeA], commune2:nameToINSEE[communeB]}), cb)
    }
}

/*
    --- Virtual Page / Side Menu LOGIC ---
 */
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