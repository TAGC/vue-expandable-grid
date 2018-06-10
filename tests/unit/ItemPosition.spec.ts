import { Extent } from "@/components/ExtentCalculator";
import ItemPositioner, { IGridItem } from "@/components/ItemPositioner";
import { expect } from "chai";
import { Description } from "../util";

describe("ItemPositioner", () => {
  describe("positions tiles in grid", () => {
    type TestCase = { grid: Extent, item: IGridItem, extent: Extent } & Description;

    const createItem = (x, y, width, height): IGridItem => ({ data: null, x, y, width, height });

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
});
