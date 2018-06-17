import { Extent, TileExtent } from "@/components/ExtentCalculator";
import ItemPositioner, { IGridItem } from "@/components/ItemPositioner";
import { expect } from "chai";
import { Description } from "../util";

describe("ItemPositioner", () => {
  describe("supports positioning items whose extents are expressed in pixels", () => {
    type TestCase = { grid: Extent, item: IGridItem, extent: Extent } & Description;

    const createItem = (x, y, width, height): IGridItem =>
      ({ extent: new Extent(x, y, width, height), data: null });

    const testCases: TestCase[] = [
      {
        description: "when grid at origin & item has no extent",
        grid: new Extent(0, 0, 100, 200),
        item: createItem(0, 0, 0, 0),
        extent: new Extent(0, 0, 0, 0),
      },
      {
        description: "when grid at origin & item has arbitrary extent",
        grid: new Extent(0, 0, 100, 200),
        item: createItem(10, -20, 50, 200),
        extent: new Extent(10, -20, 50, 200),
      },
      {
        description: "when grid offset from origin & item has arbitrary extent",
        grid: new Extent(-100, -200, 100, 200),
        item: createItem(10, -20, 50, 200),
        extent: new Extent(110, 180, 50, 200),
      },
    ];

    testCases.forEach(({ description, grid, item, extent }) => {
      it(description, () => {
        const itemPositioner = new ItemPositioner();
        itemPositioner.gridExtent = grid;

        const actualItemExtent = itemPositioner.position(item);
        expect(actualItemExtent).to.deep.equal(extent);
      });
    });
  });

  describe("supports positioning items whose extents are expressed in tiles", () => {
    type TestCase = { grid: Extent, item: IGridItem, extent: Extent } & Description;

    const createItem = (column, row, columnSpan, rowSpan): IGridItem =>
      ({ extent: new TileExtent(column, row, columnSpan, rowSpan), data: null });

    const tileSize = 10;

    const testCases: TestCase[] = [
      {
        description: "when grid at origin & item has no extent",
        grid: new Extent(0, 0, 100, 200),
        item: createItem(0, 0, 0, 0),
        extent: new Extent(0, 0, 0, 0),
      },
      {
        description: "when grid at origin & item has arbitrary extent",
        grid: new Extent(0, 0, 100, 200),
        item: createItem(1, -2, 5, 20),
        extent: new Extent(10, -20, 50, 200),
      },
      {
        description: "when grid offset from origin & item has arbitrary extent",
        grid: new Extent(-100, -200, 100, 200),
        item: createItem(1, -2, 5, 20),
        extent: new Extent(110, 180, 50, 200),
      },
    ];

    testCases.forEach(({ description, grid, item, extent }) => {
      it(description, () => {
        const itemPositioner = new ItemPositioner();
        itemPositioner.gridExtent = grid;
        itemPositioner.tileSize = tileSize;

        const actualItemExtent = itemPositioner.position(item);
        expect(actualItemExtent).to.deep.equal(extent);
      });
    });
  });
});
