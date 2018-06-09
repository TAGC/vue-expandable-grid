import { Extent } from "@/components/ExtentCalculator";
import TileGenerator, { ITile } from "@/components/TileGenerator";
import { expect } from "chai";

type Description = { description: string };
const $ = (o) => JSON.stringify(o);

describe("TileGenerator", () => {
  let tiles: ITile[] | null = null;
  const onTilesGenerated = (newTiles) => tiles = newTiles;

  beforeEach(() => {
    tiles = null;
  });

  it("generates initial set of tiles on construction", () => {
    const _ = new TileGenerator(100, (x) => x, onTilesGenerated);
    expect(tiles).to.not.be.null;
    expect(tiles).to.have.lengthOf(2 * 2);
  });

  it("scales tile sizes using the provided callback", () => {
    const tileSize = 100;
    const scaleFactor = 5;
    const scaleTiles = (size) => size * scaleFactor;
    const tileGenerator = new TileGenerator(tileSize, scaleTiles, onTilesGenerated);
    tileGenerator.gridExtent = { x: 0, y: 0, width: tileSize, height: tileSize };

    const scaledTileSize = tileSize * scaleFactor;
    tiles!.forEach((tile) => expect(tile.data.size).to.equal(scaledTileSize));
  });

  describe("generates tiles to fill grid", () => {
    type TestCase = { tileSize: number; gridExtent: Extent; expectedTiles: number } & Description;

    const testCases: TestCase[] = [
      {
        description: "when grid has zero extent",
        tileSize: 1,
        gridExtent: { x: 0, y: 0, width: 0, height: 0 },
        expectedTiles: 2 * 2,
      },
      {
        description: "when grid has arbitrary extent",
        tileSize: 20,
        gridExtent: { x: -40, y: -60, width: 400, height: 300 },
        expectedTiles: 22 * 17,
      },
      {
        description: "when grid begins at origin",
        tileSize: 10,
        gridExtent: { x: 0, y: 0, width: 100, height: 200 },
        expectedTiles: 12 * 22,
      },
      {
        description: "when grid begins slighly left of origin",
        tileSize: 10,
        gridExtent: { x: -5, y: 0, width: 100, height: 200 },
        expectedTiles: 11 * 22,
      },
      {
        description: "when grid begins slighly right of origin",
        tileSize: 10,
        gridExtent: { x: 5, y: 0, width: 100, height: 200 },
        expectedTiles: 12 * 22,
      },
      {
        description: "when grid begins slighly above origin",
        tileSize: 10,
        gridExtent: { x: 0, y: -5, width: 100, height: 200 },
        expectedTiles: 12 * 21,
      },
      {
        description: "when grid begins slighly below origin",
        tileSize: 10,
        gridExtent: { x: 0, y: 5, width: 100, height: 200 },
        expectedTiles: 12 * 22,
      },
    ];

    testCases.forEach(({ description, tileSize, gridExtent, expectedTiles }) => {
      it(description, () => {
        const tileGenerator = new TileGenerator(tileSize, (x) => x, onTilesGenerated);
        tileGenerator.gridExtent = gridExtent;

        expect(tiles).to.have.lengthOf(expectedTiles);
        tiles!.forEach((tile) => expect(tile.data.size).to.equal(tileSize));
      });
    });
  });

  describe("positions tiles in grid", () => {
    type TestCase = { tile: ITile, extent: Extent } & Description;

    const createTile = (columnIndex, rowIndex, size): ITile => ({
      data: {
        isTile: true,
        size,
        key: null,
        column: -1,  // Not used in positioning calculations
        row: -1,     // Not used in positioning calculations
        columnIndex,
        rowIndex,
      },
    });

    const test = ({ description, tile, extent }: TestCase, grid: Extent) => {
      it(description, () => {
        const tileGenerator = new TileGenerator(tile.data.size, (x) => x, onTilesGenerated);
        tileGenerator.gridExtent = grid;

        const actualTileExtent = tileGenerator.position(tile);
        expect(actualTileExtent).to.deep.equal(extent);
      });
    };

    context("when grid extent aligns with tiles", () => {
      const grid: Extent = { x: 0, y: 0, width: 100, height: 100 };

      const testCases: TestCase[] = [
        {
          description: "when tile is at first column and row",
          tile: createTile(0, 0, 10),
          extent: { x: -10, y: -10, width: 10, height: 10 },
        },
        {
          description: "when tile is at last column and row",
          tile: createTile(11, 11, 10),
          extent: { x: 100, y: 100, width: 0, height: 0 },
        },
        {
          description: "when tile is at arbitrary column and row",
          tile: createTile(1, 3, 20),
          extent: { x: 0, y: 40, width: 20, height: 20 },
        },
      ];

      testCases.forEach((testCase) => test(testCase, grid));
    });

    context("when grid extent does not align with tiles", () => {
      const grid: Extent = { x: -10, y: -5, width: 100, height: 100 };

      const testCases: TestCase[] = [
        {
          description: "when tile is at first column and row",
          tile: createTile(0, 0, 20),
          extent: { x: -10, y: -15, width: 20, height: 20 },
        },
        {
          description: "when tile is at last column and row",
          tile: createTile(5, 5, 20),
          extent: { x: 90, y: 85, width: 10, height: 15 },
        },
        {
          description: "when tile is at arbitrary column and row",
          tile: createTile(2, 1, 20),
          extent: { x: 30, y: 5, width: 20, height: 20 },
        },
      ];

      testCases.forEach((testCase) => test(testCase, grid));
    });
  });
});
