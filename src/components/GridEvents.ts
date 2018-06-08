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
}

/**
 * Represents the data associated with a grid mouse move event.
 */
export type IGridMouseMoveEventArgs = IGridMouseEventArgs;

/**
 * Represents the data associated with a grid mouse down event.
 */
export type IGridClickEventArgs = IGridMouseEventArgs;
