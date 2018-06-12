/**
 * Represents the data associated with an arbitrary grid mouse event.
 */
interface IGridMouseEventArgs {
  /**
   * The x ordinate of the mouse event within the grid.
   */
  x: number;

  /**
   * The y ordinate of the mouse event within the grid.
   */
  y: number;

  /**
   * The logical column the mouse event occurred within.
   */
  column: number;

  /**
   * The logical row the mouse event occurred within.
   */
  row: number;
}

/**
 * Represents the data associated with a grid mouse move event.
 */
export type IGridMouseMoveEventArgs = IGridMouseEventArgs;

/**
 * Represents the data associated with a grid mouse down event.
 */
export type IGridClickEventArgs = IGridMouseEventArgs;

/**
 * Represents the data associated with grid resize events.
 */
export interface IGridResizeEventArgs {
  /**
   * The first logical row in the grid.
   */
  firstRow: number;

  /**
   * The first logical column in the grid.
   */
  firstColumn: number;

  /**
   * The last logical row in the grid.
   */
  lastRow: number;

  /**
   * The last logical row in the grid.
   */
  lastColumn: number;

  /**
   * The number of rows in the grid.
   *
   * Equivalent to `lastRow` - `firstRow`.
   */
  numberOfRows: number;

  /**
   * The number of columns in the grid.
   *
   * Equivalent to `lastRow` - `firstRow`.
   */
  numberOfColumns: number;
}
