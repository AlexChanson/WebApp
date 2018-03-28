"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var populationSlider = new Slider('#slider-population', {
    min: 0,
    max: 1500000,
    value: [0, 1500000],
    scale: "logarithmic",
    range: true
});

var FilterMenuViewModel = function () {
    function FilterMenuViewModel() {
        var _this = this;

        _classCallCheck(this, FilterMenuViewModel);

        this.toggleClose = ko.observable(false);
        this.populationMin = ko.observable(0);
        this.populationMax = ko.observable(1500000);
        this.submitText = ko.observable("Afficher les données");

        populationSlider.on("change", function () {
            var range = populationSlider.getValue();

            _this.populationMin(range[0]);
            _this.populationMax(range[1]);
        });
    }

    _createClass(FilterMenuViewModel, [{
        key: "submitFilters",
        value: function submitFilters() {
            this.toggleClose(true);
        }
    }, {
        key: "openFilters",
        value: function openFilters() {
            this.toggleClose(false);
            this.submitText("Mettre à jour les données");
        }
    }]);

    return FilterMenuViewModel;
}();

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
