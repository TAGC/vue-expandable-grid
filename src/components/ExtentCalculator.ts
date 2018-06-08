import * as _ from "lodash";

/**
 * Represents the position of an entity on a cartesian plane.
 */
export interface IPosition {
  x: number;
  y: number;
}

/**
 * Represents the size of an entity on a cartesian plane.
 */
export interface ISize {
  width: number;
  height: number;
}

/**
 * Represents the extent an entity covers of a cartesian plane.
 */
export type Extent = IPosition & ISize;

/**
 * Represents an entity located at the origin of a cartesian plane.
 */
export const ORIGIN: IPosition = {
  x: 0,
  y: 0,
};

/**
 * Represents an entity with zero width and height.
 */
export const ZERO_SIZE: ISize = {
  width: 0,
  height: 0,
};

/**
 * Represents an entity with no extent.
 */
export const ZERO_EXTENT: Extent = {
  x: ORIGIN.x,
  y: ORIGIN.y,
  width: ZERO_SIZE.width,
  height: ZERO_SIZE.height,
};

/**
 * A class used for calculating the extent of the grid.
 */
export default class ExtentCalculator {
  public static scaleExtent(extent: Extent, scaleFactor: number): Extent {
    return {
      ...extent,
      x: extent.x * scaleFactor,
      y: extent.y * scaleFactor,
      width: extent.width * scaleFactor,
      height: extent.height * scaleFactor,
    };
  }

  public static scalePosition(position: IPosition, scaleFactor: number) {
    return {
      ...position,
      x: position.x * scaleFactor,
      y: position.y * scaleFactor,
    };
  }

  public static descaleExtent(extent: Extent, scaleFactor: number) {
    return ExtentCalculator.scaleExtent(extent, 1 / scaleFactor);
  }

  public static descalePosition(position: IPosition, scaleFactor: number) {
    return ExtentCalculator.scalePosition(position, 1 / scaleFactor);
  }

  /**
   * Calculates the extent of the grid based on the extent of the viewports and the items on the
   * grid.
   *
   * All values are expected and returned in logical (zoom-independent) grid coordinate space.
   *
   * @param viewportExtent the extent of the grid viewport
   * @param itemExtents the individual extents of all the items located on the grid
   * @return the necessary extent of the grid
   */
  public static calculateGridExtent(viewportExtent: Extent, itemExtents: Extent[]): Extent {
    const minimumExtent = ExtentCalculator.deriveMinimumGridExtent(viewportExtent);
    const gridExtent = ExtentCalculator.reduceExtents([minimumExtent, ...itemExtents]);

    return gridExtent;
  }

  /**
   * Derives the necessary extent of the grid based purely on the extent of the viewport.
   *
   * In other words, this is the extent the grid will have if there are no other extents that
   * need to be taken into consideration e.g. items placed on the grid.
   *
   * The viewport extent is expected to be provided in logical grid coordinate space. The extent
   * of the viewport in this coordinate space is expected to grow when the grid is zoomed out and
   * vice versa.
   *
   * The minimum necessary extent will also be returned in logical grid coordinate space.
   *
   * @param viewportExtent the viewport extent
   * @return the necessary extent of the grid based on `viewportExtent`
   */
  private static deriveMinimumGridExtent(viewportExtent: Extent): Extent {
    const minX = Math.min(viewportExtent.x, 0);
    const minY = Math.min(viewportExtent.y, 0);
    const maxX = viewportExtent.width + Math.max(viewportExtent.x, 0);
    const maxY = viewportExtent.height + Math.max(viewportExtent.y, 0);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Calculates the smallest extent that encapsulates all extents in the provided collection.
   *
   * @param extents the collection of extents to reduce
   * @return the smallest extent that encapsulates `extents`
   */
  private static reduceExtents(extents: Extent[]): Extent {
    if (!extents || _.isEmpty(extents)) {
      return ZERO_EXTENT;
    }

    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    for (const extent of extents) {
      minX = Math.min(minX, extent.x);
      minY = Math.min(minY, extent.y);
      maxX = Math.max(maxX, extent.x + extent.width);
      maxY = Math.max(maxY, extent.y + extent.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
