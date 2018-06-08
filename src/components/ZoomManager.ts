import * as _ from "lodash";

export type ZoomEventHandler = (zoomLevel: number) => void;

export default class ZoomManager {
  private readonly zoomLevels: number[];
  private readonly defaultZoomLevelIndex: number;
  private zoomLevelIndex = 0;

  constructor(zoomLevels: Set<number>, readonly onZoomChange: ZoomEventHandler) {
    if (!zoomLevels.has(1)) {
      throw new Error("Zoom levels set does not contain required zoom level of 1");
    }

    this.zoomLevels = _.sortBy([...zoomLevels]);
    this.defaultZoomLevelIndex = this.zoomLevels.indexOf(1);
    this.resetZoom();
  }

  public get zoomLevel() {
    return this.zoomLevels[this.zoomLevelIndex];
  }

  public tryIncreaseZoom() {
    if (this.zoomLevelIndex === this.zoomLevels.length - 1) {
      return;
    }

    this.zoomLevelIndex++;
    this.publishZoomLevel();
  }

  public tryDecreaseZoom() {
    if (this.zoomLevelIndex === 0) {
      return;
    }

    this.zoomLevelIndex--;
    this.publishZoomLevel();
  }

  public resetZoom() {
    this.zoomLevelIndex = this.defaultZoomLevelIndex;
    this.publishZoomLevel();
  }

  private publishZoomLevel() {
    this.onZoomChange(this.zoomLevel);
  }
}
