import { Extent, ZERO_EXTENT } from "./ExtentCalculator";
import GridManager from "./GridManager";

/**
 * Represents an item that can be placed on the grid.
 */
export interface IGridItem extends Extent {
  data: any;
}

/**
 * A type of grid manager responsible for handling the position of items on the grid.
 */
export default class ItemPositioner extends GridManager<IGridItem> {
  private _gridExtent: Extent;

  constructor() {
    super();
    this.gridExtent = ZERO_EXTENT;
  }

  set gridExtent(newExtent: Extent) {
    this._gridExtent = newExtent;
  }

  get gridExtent(): Extent {
    return this._gridExtent;
  }

  public canManage(object: any): object is IGridItem {
    return object.data && !object.data.isTile;
  }

  public position(item: IGridItem): Extent {
    const grid = this.gridExtent;

    // Positioning is done in *logical* (zoom-independent) grid coordinate space.

    return new Extent(
      item.x - (grid.x < 0 ? grid.x : 0),
      item.y - (grid.y < 0 ? grid.y : 0),
      item.width,
      item.height);
  }
}
