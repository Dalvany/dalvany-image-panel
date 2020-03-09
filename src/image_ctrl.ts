import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import TimeSeries from 'grafana/app/core/time_series2';
import _ from 'lodash';
import './css/image.css';

export class ImageCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  series = []
  baseUrl = "http://openweathermap.org/img/wn/"
  value = ""
  suffix = "@2x.png"
  completeUrl = ""

  /** @ngInject */
  constructor($scope: any, $injector: any) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, {});
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));
    this.events.on('render', this.render.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/dalvany-image-panel/editor.html', 2);
  }

  render() {
  }

  isBlank(str) {
    return (!str || /^\s*$/.test(str));
  }

  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.value = (_.last((this.series[0] as TimeSeries).datapoints) as Array<string>)[0]
    if (!this.isBlank(this.baseUrl) && !this.isBlank(this.value)) {
      this.completeUrl = this.baseUrl + this.value
      if (!this.isBlank(this.suffix)) {
        this.completeUrl = this.completeUrl + this.suffix
      }
    } else {
      this.completeUrl = ""
    }
    this.render()
  }

  onDataSnapshotLoad(snapshotData) {
    this.onDataReceived(snapshotData);
  }

  seriesHandler(seriesData) {
    const series = new TimeSeries({
      datapoints: seriesData.datapoints || [],
      alias: seriesData.target,
    });
    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);

    return series;
  }
}

export { ImageCtrl as MetricsPanelCtrl };
