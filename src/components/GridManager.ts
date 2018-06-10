import { Extent } from "./ExtentCalculator";

/**
 * An abstract class for managing the placement of objects on the grid.
 *
 * @param T the type of objects managed by this class.
 */
export default abstract class GridManager<T> {
  /**
   * Sets the grid extent.
   */
  abstract set gridExtent(newExtent: Extent);

  /**
   * Gets the grid extent.
   */
  abstract get gridExtent(): Extent;

  /**
   * Returns the position that a given object should be placed within the grid.
   *
   * @param object the object to place
   */
  public abstract position(object: T): Extent;

  /**
   * Returns whether this instance can manage the provided object.
   *
   * @param object the object to check can be managed by this instance
   */
  public abstract canManage(object: any): object is T;
}
