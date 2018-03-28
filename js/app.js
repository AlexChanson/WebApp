const populationSlider = new Slider('#slider-population', {
    min: 0,
    max: 1500000,
    value: [0, 1500000],
    scale: "logarithmic",
    range: true
});

class FilterMenuViewModel {
    constructor() {
        this.toggleClose = ko.observable(false);
        this.populationMin = ko.observable(0);
        this.populationMax = ko.observable(1500000);
        this.submitText = ko.observable("Afficher les données");

        populationSlider.on("change", () => {
            const range = populationSlider.getValue();

            this.populationMin(range[0]);
            this.populationMax(range[1]);
        });
    }

    submitFilters() {
        this.toggleClose(true);
    }

    openFilters() {
        this.toggleClose(false);
        this.submitText("Mettre à jour les données");
    }
}

ko.applyBindings(new FilterMenuViewModel());

Highcharts.mapChart('map', {
    chart: {
        map: 'countries/fr/fr-all',
        backgroundColor: "#495057"
    },
    series: [{
        showInLegend: false
    }, {
            name: 'Separators',
            type: 'mapline',
            data: Highcharts.geojson(Highcharts.maps['countries/fr/fr-all'], 'mapline'),
            color: 'silver',
            enableMouseTracking: false,
            showInLegend: false
        }]
});
