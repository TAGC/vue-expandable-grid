import ExtentCalculator, {
  Extent,
  Position,
  TileExtent,
  ZERO_EXTENT,
} from "@/components/ExtentCalculator";
import { expect } from "chai";
import { Description } from "../util";

describe("ExtentCalculator", () => {
  it("scales positions", () => {
    const scaleFactor = 10;
    const position = new Position(20, 50);
    const scaledPosition = ExtentCalculator.scalePosition(position, scaleFactor);

    expect(scaledPosition.x).to.equal(200);
    expect(scaledPosition.y).to.equal(500);
  });

  it("descales positions", () => {
    const scaleFactor = 4;
    const position = new Position(40, 120);
    const descaledPosition = ExtentCalculator.descalePosition(position, scaleFactor);

    expect(descaledPosition.x).to.equal(10);
    expect(descaledPosition.y).to.equal(30);
  });

  it("scales extents", () => {
    const scaleFactor = 2;
    const extent = new Extent(10, 15, 100, 200);
    const scaledExtent = ExtentCalculator.scaleExtent(extent, scaleFactor);

    expect(scaledExtent.x).to.equal(20);
    expect(scaledExtent.y).to.equal(30);
    expect(scaledExtent.width).to.equal(200);
    expect(scaledExtent.height).to.equal(400);
  });

  it("descales extents", () => {
    const scaleFactor = 5;
    const extent = new Extent(100, 250, 30, 60);
    const descaledExtent = ExtentCalculator.descaleExtent(extent, scaleFactor);

    expect(descaledExtent.x).to.equal(20);
    expect(descaledExtent.y).to.equal(50);
    expect(descaledExtent.width).to.equal(6);
    expect(descaledExtent.height).to.equal(12);
  });

  it("ensures the grid extent is at least the forced minimum extent", () => {
    const forcedMinimumExtent = new Extent(-50, -100, 200, 500);

    const actualGridExtent = ExtentCalculator.calculateGridExtent(
      ZERO_EXTENT,
      forcedMinimumExtent,
      0,
      []);

    expect(actualGridExtent.x).is.at.most(forcedMinimumExtent.x);
    expect(actualGridExtent.y).is.at.most(forcedMinimumExtent.y);
    expect(actualGridExtent.x + actualGridExtent.width)
      .is.at.least(forcedMinimumExtent.x + forcedMinimumExtent.width);
    expect(actualGridExtent.y + actualGridExtent.height)
      .is.at.least(forcedMinimumExtent.y + forcedMinimumExtent.height);
  });

  describe("tests whether positions are contained within extents", () => {
    type TestCase = { position: Position, extent: Extent, expectation: boolean } & Description;

    const testCases: TestCase[] = [
      {
        description: "when extent has no size and position lies on it",
        position: new Position(0, 0),
        extent: new Extent(0, 0, 0, 0),
        expectation: true,
      },
      {
        description: "when extent has no size and position lies off of it",
        position: new Position(0, 1),
        extent: new Extent(0, 0, 0, 0),
        expectation: false,
      },
      {
        description: "when position lies on bottom boundary of extent",
        position: new Position(5, 20),
        extent: new Extent(5, 10, 20, 10),
        expectation: true,
      },
      {
        description: "when position lies on left boundary of extent",
        position: new Position(15, 6),
        extent: new Extent(-10, 5, 25, 3),
        expectation: true,
      },
      {
        description: "when position lies entirely within extent",
        position: new Position(15, 25),
        extent: new Extent(0, 0, 100, 100),
        expectation: true,
      },
      {
        description: "when position lies entirely outside extent",
        position: new Position(15, 25),
        extent: new Extent(-100, -100, 100, 100),
        expectation: false,
      },
    ];

    testCases.forEach(({ description, position, extent, expectation }) => {
      it(description, () => {
        const result = ExtentCalculator.isPositionInExtent(position, extent);
        expect(result).to.equal(expectation);
      });
    });
  });

  describe("calculates the minimum grid extent from viewport at:", () => {
    type TestCase = { position: string, viewport: Extent, grid: Extent };
    const testCases: TestCase[] = [
      {
        position: "origin",
        viewport: new Extent(0, 0, 50, 100),
        grid: new Extent(0, 0, 50, 100),
      },
      {
        position: "bottom-right quadrant",
        viewport: new Extent(50, 100, 200, 400),
        grid: new Extent(0, 0, 250, 500),
      },
      {
        position: "top-right quadrant",
        viewport: new Extent(50, -100, 300, 500),
        grid: new Extent(0, -100, 350, 600),
      },
      {
        position: "top-left quadrant",
        viewport: new Extent(-50, -100, 400, 600),
        grid: new Extent(-50, -100, 450, 700),
      },
      {
        position: "bottom-left quadrant",
        viewport: new Extent(-50, 100, 500, 700),
        grid: new Extent(-50, 0, 550, 800),
      },
    ];

    testCases.forEach(({ position, viewport, grid }) => {
      it(position, () => {
        const actualGridExtent = ExtentCalculator.calculateGridExtent(viewport, ZERO_EXTENT, 0, []);
        expect(actualGridExtent).to.deep.equal(grid);
      });
    });
  });

  describe("calculates the minimum grid extent when:", () => {
    const viewport = new Extent(20, 50, 100, 200);
    const tileSize = 10;

    type TestCase = { items: Array<Extent | TileExtent>, grid: Extent } & Description;
    const testCases: TestCase[] = [
      {
        description: "no items in grid",
        items: [],
        grid: new Extent(0, 0, 120, 250),
      },
      {
        description: "one item in grid, fully inside viewport",
        items: [new Extent(50, 50, 10, 100)],
        grid: new Extent(0, 0, 120, 250),
      },
      {
        description: "one item in grid, partially inside viewport",
        items: [new Extent(50, 50, 200, 100)],
        grid: new Extent(0, 0, 250, 250),
      },
      {
        description: "one item in grid, outside viewport",
        items: [new Extent(150, 250, 20, 50)],
        grid: new Extent(0, 0, 170, 300),
      },
      {
        description: "two items in grid",
        items: [
          new Extent(-50, -100, 200, 100),
          new Extent(150, 250, 20, 50),
        ],
        grid: new Extent(-50, -100, 220, 400),
      },
      {
        description: "two items in grid, expressed in units of tiles",
        items: [
          new TileExtent(-5, -10, 20, 10),
          new TileExtent(15, 25, 2, 5),
        ],
        grid: new Extent(-50, -100, 220, 400),
      },
    ];

    testCases.forEach(({ description, items, grid }) => {
      it(description, () => {
        const actualGridExtent = ExtentCalculator.calculateGridExtent(
          viewport,
          ZERO_EXTENT,
          tileSize,
          items);

        expect(actualGridExtent).to.deep.equal(grid);
      });
    });
  });
});
