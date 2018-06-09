import ExtentCalculator, { Extent, IPosition } from "@/components/ExtentCalculator";
import { expect } from "chai";

const $ = (o: any) => JSON.stringify(o);

describe("ExtentCalculator", () => {
  it("scales positions", () => {
    const scaleFactor = 10;
    const position: IPosition = {
      x: 20,
      y: 50,
    };

    const scaledPosition = ExtentCalculator.scalePosition(position, scaleFactor);
    expect(scaledPosition.x).to.equal(200);
    expect(scaledPosition.y).to.equal(500);
  });

  it("descales positions", () => {
    const scaleFactor = 4;
    const position: IPosition = {
      x: 40,
      y: 120,
    };

    const descaledPosition = ExtentCalculator.descalePosition(position, scaleFactor);
    expect(descaledPosition.x).to.equal(10);
    expect(descaledPosition.y).to.equal(30);
  });

  it("scales extents", () => {
    const scaleFactor = 2;
    const extent: Extent = {
      x: 10,
      y: 15,
      width: 100,
      height: 200,
    };

    const scaledExtent = ExtentCalculator.scaleExtent(extent, scaleFactor);
    expect(scaledExtent.x).to.equal(20);
    expect(scaledExtent.y).to.equal(30);
    expect(scaledExtent.width).to.equal(200);
    expect(scaledExtent.height).to.equal(400);
  });

  it("descales extents", () => {
    const scaleFactor = 5;
    const extent: Extent = {
      x: 100,
      y: 250,
      width: 30,
      height: 60,
    };

    const descaledExtent = ExtentCalculator.descaleExtent(extent, scaleFactor);
    expect(descaledExtent.x).to.equal(20);
    expect(descaledExtent.y).to.equal(50);
    expect(descaledExtent.width).to.equal(6);
    expect(descaledExtent.height).to.equal(12);
  });

  describe("calculates the minimum grid extent from viewport at:", () => {
    type TestCase = { position: string, viewport: Extent, grid: Extent };
    const testCases: TestCase[] = [
      {
        position: "origin",
        viewport: { x: 0, y: 0, width: 50, height: 100 },
        grid: { x: 0, y: 0, width: 50, height: 100 },
      },
      {
        position: "bottom-right quadrant",
        viewport: { x: 50, y: 100, width: 200, height: 400 },
        grid: { x: 0, y: 0, width: 250, height: 500 },
      },
      {
        position: "top-right quadrant",
        viewport: { x: 50, y: -100, width: 300, height: 500 },
        grid: { x: 0, y: -100, width: 350, height: 600 },
      },
      {
        position: "top-left quadrant",
        viewport: { x: -50, y: -100, width: 400, height: 600 },
        grid: { x: -50, y: -100, width: 450, height: 700 },
      },
      {
        position: "bottom-left quadrant",
        viewport: { x: -50, y: 100, width: 500, height: 700 },
        grid: { x: -50, y: 0, width: 550, height: 800 },
      },
    ];

    testCases.forEach(({ position, viewport, grid }) => {
      it(position, () => {
        const actualGridExtent = ExtentCalculator.calculateGridExtent(viewport, []);
        expect(actualGridExtent).to.deep.equal(grid);
      });
    });
  });

  describe("calculates the minimum grid extent when:", () => {
    const viewport: Extent = { x: 20, y: 50, width: 100, height: 200 };

    type TestCase = { description: string, items: Extent[], grid: Extent };
    const testCases: TestCase[] = [
      {
        description: "no items in grid",
        items: [],
        grid: { x: 0, y: 0, width: 120, height: 250 },
      },
      {
        description: "one item in grid, fully inside viewport",
        items: [{ x: 50, y: 50, width: 10, height: 100 }],
        grid: { x: 0, y: 0, width: 120, height: 250 },
      },
      {
        description: "one item in grid, partially inside viewport",
        items: [{ x: 50, y: 50, width: 200, height: 100 }],
        grid: { x: 0, y: 0, width: 250, height: 250 },
      },
      {
        description: "one item in grid, outside viewport",
        items: [{ x: 150, y: 250, width: 20, height: 50 }],
        grid: { x: 0, y: 0, width: 170, height: 300 },
      },
      {
        description: "two items in grid",
        items: [
          { x: -50, y: -100, width: 200, height: 100 },
          { x: 150, y: 250, width: 20, height: 50 },
        ],
        grid: { x: -50, y: -100, width: 220, height: 400 },
      },
    ];

    testCases.forEach(({ description, items, grid }) => {
      it(description, () => {
        const actualGridExtent = ExtentCalculator.calculateGridExtent(viewport, items);
        expect(actualGridExtent).to.deep.equal(grid);
      });
    });
  });
});
