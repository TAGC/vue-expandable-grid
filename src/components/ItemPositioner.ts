import { Extent, TileExtent, ZERO_EXTENT } from "./ExtentCalculator";
import GridManager from "./GridManager";

/**
 * Represents an item that can be placed on the grid.
 */
export interface IGridItem {
  id?: string;
  data: any;
  extent: Extent | TileExtent;
}

/**
 * A type of grid manager responsible for handling the position of items on the grid.
 */
export default class ItemPositioner extends GridManager<IGridItem> {
  private _gridExtent: Extent;
  private _tileSize: number;

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

  set tileSize(newTileSize: number) {
    this._tileSize = newTileSize;
  }

  get tileSize(): number {
    return this._tileSize;
  }

  public canManage(object: any): object is IGridItem {
    return object.data && !object.data.isTile;
  }

  public position(item: IGridItem): Extent {
    const grid = this.gridExtent;

    // Positioning is done in *logical* (zoom-independent) grid coordinate space.
    const extent = this.getItemExtent(item);

    return new Extent(
      extent.x - (grid.x < 0 ? grid.x : 0),
      extent.y - (grid.y < 0 ? grid.y : 0),
      extent.width,
      extent.height);
  }

  private getItemExtent(item: IGridItem): Extent {
    switch (item.extent.type) {
      case "Extent": return item.extent;
      case "TileExtent": return TileExtent.toExtent(item.extent, this.tileSize);
      default: throw new Error(`Unknown extent type for item: ${JSON.stringify(item)}`);
    }
  }
}
