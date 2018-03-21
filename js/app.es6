class FilterMenuViewModel {
    constructor() {
        this.toggleClose = ko.observable(false);
    }

    closeMenu() {
        this.toggleClose(true);
    }

    openMenu() {
        this.toggleClose(false);
    }
}

ko.applyBindings(new FilterMenuViewModel());

Highcharts.mapChart('map', {
    chart: {
        map: 'countries/fr/fr-all'
    },
    series: [{
      showInLegend: false,
    }, {
            name: 'Separators',
            type: 'mapline',
            data: Highcharts.geojson(Highcharts.maps['countries/fr/fr-all'], 'mapline'),
            color: 'silver',
            enableMouseTracking: false,
            showInLegend: false
        }]
});
