import { sortBy } from "lodash";

/**
 * Represents a callback that is invoked to handle a change in the zoom level.
 */
export type ZoomEventHandler = (zoomLevel: number) => void;

/**
 * A class used for controlling the level of zoom applied to the grid.
 */
export default class ZoomManager {
  private readonly zoomLevels: number[];
  private readonly defaultZoomLevelIndex: number;
  private zoomLevelIndex = 0;

  constructor(zoomLevels: Set<number>, readonly onZoomChange: ZoomEventHandler) {
    if (!zoomLevels.has(1)) {
      throw new Error("Zoom levels set does not contain required zoom level of 1");
    }

    this.zoomLevels = sortBy([...zoomLevels]);
    this.defaultZoomLevelIndex = this.zoomLevels.indexOf(1);
    this.resetZoom();
  }

  /**
   * Gets the current grid zoom level.
   */
  public get zoomLevel() {
    return this.zoomLevels[this.zoomLevelIndex];
  }

  /**
   * Increases the grid zoom by one level if possible.
   *
   * If the grid is already at maximum zoom, this method has no effect.
   */
  public tryIncreaseZoom() {
    if (this.zoomLevelIndex === this.zoomLevels.length - 1) {
      return;
    }

    this.zoomLevelIndex++;
    this.publishZoomLevel();
  }

  /**
   * Decreases the grid zoom by one level if possible.
   *
   * If the grid is already at minimum zoom, this method has no effect.
   */
  public tryDecreaseZoom() {
    if (this.zoomLevelIndex === 0) {
      return;
    }

    this.zoomLevelIndex--;
    this.publishZoomLevel();
  }

  /**
   * Resets the grid zoom to the default level (1).
   */
  public resetZoom() {
    this.zoomLevelIndex = this.defaultZoomLevelIndex;
    this.publishZoomLevel();
  }

  private publishZoomLevel() {
    this.onZoomChange(this.zoomLevel);
  }
}
