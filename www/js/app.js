'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FilterMenuViewModel = function () {
    function FilterMenuViewModel() {
        _classCallCheck(this, FilterMenuViewModel);

        this.toggleClose = ko.observable(false);
    }

    _createClass(FilterMenuViewModel, [{
        key: 'closeMenu',
        value: function closeMenu() {
            this.toggleClose(true);
        }
    }, {
        key: 'openMenu',
        value: function openMenu() {
            this.toggleClose(false);
        }
    }]);

    return FilterMenuViewModel;
}();

ko.applyBindings(new FilterMenuViewModel());

Highcharts.mapChart('map', {
    chart: {
        map: 'countries/fr/fr-all'
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
