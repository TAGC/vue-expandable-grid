import * as _ from "lodash";
import { Extent, ZERO_EXTENT } from "./ExtentCalculator";
import GridManager from "./GridManager";

/**
 * Represents a grid tile.
 */
export interface ITile {
  data: {
    isTile: true;
    size: number;
    key: any;
    column: number;
    row: number;
    columnIndex: number;
    rowIndex: number;
  };
}

export interface ITileStatistics {
  firstRow: number;
  firstColumn: number;
  lastRow: number;
  lastColumn: number;
}

/**
 * Represents a callback to invoke when the grid tiles are regenerated.
 */
export type TileRegeneratedHandler = (newTiles: ITile[], statistics: ITileStatistics) => void;

/**
 * A type of grid manager that handles the generation and positioning of grid tiles.
 */
export default class TileGenerator extends GridManager<ITile> {
  private _zoomLevel: number;
  private _gridExtent: Extent;

  /**
   * Creates a new instance of TileManager.
   *
   * @param tileSize the length and width of the tiles in pixels at default zoom level
   * @param onTilesRegenerated the callback to invoke when tiles are regenerated
   */
  constructor(
    readonly tileSize: number,
    readonly scaleTile: (tileSize: number) => number,
    readonly onTilesRegenerated: TileRegeneratedHandler,
  ) {
    super();
    this._gridExtent = ZERO_EXTENT;
    this.regenerateTiles();
  }

  set gridExtent(newExtent: Extent) {
    this._gridExtent = newExtent;
    this.regenerateTiles();
  }

  get gridExtent(): Extent {
    return this._gridExtent;
  }

  private get columnOffset(): number {
    const { x: minX } = this.gridExtent;

    // By default offset is the maximum negative value. This means there's one hidden column of
    // tiles located just left of the grid extent.
    let offset = -this.tileSize;

    // As the grid expands leftwards (minX -> inf), this *raises* the offset back towards 0, making
    // the tiles in the left column appear to move rightwards.
    offset -= minX % this.tileSize;

    return offset;
  }

  private get lastColumnWidth(): number {
    const { width } = this.gridExtent;
    const offset = this.columnOffset;

    return (width - offset) % this.tileSize;
  }

  private get columns(): number {
    const { width } = this.gridExtent;
    const offset = this.columnOffset;

    return Math.floor((width - offset) / this.tileSize) + 1;
  }

  private get rowOffset(): number {
    const { y: minY } = this.gridExtent;

    // By default offset is the maximum negative value. This means there's one hidden row of tiles
    // located just above the grid extent.
    let offset = -this.tileSize;

    // As the grid expands upwards (minY -> inf), this *raises* the offset back towards 0, making
    // the tiles in the top row appear to move downwards.
    offset -= minY % this.tileSize;

    return offset;
  }

  private get lastRowHeight(): number {
    const { height } = this.gridExtent;
    const offset = this.rowOffset;

    return (height - offset) % this.tileSize;
  }

  private get rows(): number {
    const { height } = this.gridExtent;
    const offset = this.rowOffset;

    return Math.floor((height - offset) / this.tileSize) + 1;
  }

  public canManage(object: any): object is ITile {
    return !_.isUndefined(object.data) && object.data.isTile;
  }

  public position({ data: tile }: ITile): Extent {
    const isLastRow = tile.rowIndex === this.rows - 1;
    const isLastColumn = tile.columnIndex === this.columns - 1;

    // Tile positioning is done in *logical* (i.e. zoom-independent) grid coordinate space.

    return new Extent(
      tile.columnIndex * this.tileSize + this.columnOffset,
      tile.rowIndex * this.tileSize + this.rowOffset,
      isLastColumn ? this.lastColumnWidth : this.tileSize,
      isLastRow ? this.lastRowHeight : this.tileSize);
  }

  public notifyZoomLevelChange() {
    this.regenerateTiles();
  }

  private regenerateTiles() {
    const tiles = Array<ITile>();
    const { x, y } = this.gridExtent;
    const firstRow = y >= 0 ? -1 : Math.floor((y - 1) / this.tileSize);
    const firstColumn = x >= 0 ? -1 : Math.floor((x - 1) / this.tileSize);

    // Although tiles are positioned in logical grid coordinate space, they
    // will still physically change size depending on zoom level so we need
    // to account for this.
    const physicalTileSize = this.scaleTile(this.tileSize);

    for (const columnIndex of _.range(this.columns)) {
      for (const rowIndex of _.range(this.rows)) {
        const column = firstColumn + columnIndex;
        const row = firstRow + rowIndex;

        tiles.push({
          data: {
            key: `${column * this.tileSize},${row * this.tileSize}`,
            isTile: true,
            size: physicalTileSize,
            column,
            row,
            columnIndex,
            rowIndex,
          },
        });
      }
    }

    const statistics: ITileStatistics = {
      firstRow,
      firstColumn,
      lastRow: firstRow + this.rows,
      lastColumn: firstColumn + this.columns,
    };

    this.onTilesRegenerated(tiles, statistics);
  }
}
