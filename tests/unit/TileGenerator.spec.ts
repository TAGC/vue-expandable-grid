import { Extent } from "@/components/ExtentCalculator";
import TileGenerator, { ITile } from "@/components/TileGenerator";
import { expect } from "chai";
import { Description } from "../util";

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
    tileGenerator.gridExtent = new Extent(0, 0, tileSize, tileSize);

    const scaledTileSize = tileSize * scaleFactor;
    tiles!.forEach((tile) => expect(tile.data.size).to.equal(scaledTileSize));
  });

  describe("generates tiles to fill grid", () => {
    type TestCase = { tileSize: number; gridExtent: Extent; expectedTiles: number } & Description;

    const testCases: TestCase[] = [
      {
        description: "when grid has zero extent",
        tileSize: 1,
        gridExtent: new Extent(0, 0, 0, 0),
        expectedTiles: 2 * 2,
      },
      {
        description: "when grid has arbitrary extent",
        tileSize: 20,
        gridExtent: new Extent(-40, -60, 400, 300),
        expectedTiles: 22 * 17,
      },
      {
        description: "when grid begins at origin",
        tileSize: 10,
        gridExtent: new Extent(0, 0, 100, 200),
        expectedTiles: 12 * 22,
      },
      {
        description: "when grid begins slighly left of origin",
        tileSize: 10,
        gridExtent: new Extent(-5, 0, 100, 200),
        expectedTiles: 11 * 22,
      },
      {
        description: "when grid begins slighly right of origin",
        tileSize: 10,
        gridExtent: new Extent(5, 0, 100, 200),
        expectedTiles: 12 * 22,
      },
      {
        description: "when grid begins slighly above origin",
        tileSize: 10,
        gridExtent: new Extent(0, -5, 100, 200),
        expectedTiles: 12 * 21,
      },
      {
        description: "when grid begins slighly below origin",
        tileSize: 10,
        gridExtent: new Extent(0, 5, 100, 200),
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

    // Column and row not used in positioning - only their indices.
    const createTile = (columnIndex, rowIndex, size): ITile =>
      ({ data: { isTile: true, size, key: null, column: -1, row: -1, columnIndex, rowIndex } });

    const test = ({ description, tile, extent }: TestCase, grid: Extent) => {
      it(description, () => {
        const tileGenerator = new TileGenerator(tile.data.size, (x) => x, onTilesGenerated);
        tileGenerator.gridExtent = grid;

        const actualTileExtent = tileGenerator.position(tile);
        expect(actualTileExtent).to.deep.equal(extent);
      });
    };

    context("when grid extent aligns with tiles", () => {
      const grid = new Extent(0, 0, 100, 100);

      const testCases: TestCase[] = [
        {
          description: "when tile is at first column and row",
          tile: createTile(0, 0, 10),
          extent: new Extent(-10, -10, 10, 10),
        },
        {
          description: "when tile is at last column and row",
          tile: createTile(11, 11, 10),
          extent: new Extent(100, 100, 0, 0),
        },
        {
          description: "when tile is at arbitrary column and row",
          tile: createTile(1, 3, 20),
          extent: new Extent(0, 40, 20, 20),
        },
      ];

      testCases.forEach((testCase) => test(testCase, grid));
    });

    context("when grid extent does not align with tiles", () => {
      const grid = new Extent(-10, -5, 100, 100);

      const testCases: TestCase[] = [
        {
          description: "when tile is at first column and row",
          tile: createTile(0, 0, 20),
          extent: new Extent(-10, -15, 20, 20),
        },
        {
          description: "when tile is at last column and row",
          tile: createTile(5, 5, 20),
          extent: new Extent(90, 85, 10, 15),
        },
        {
          description: "when tile is at arbitrary column and row",
          tile: createTile(2, 1, 20),
          extent: new Extent(30, 5, 20, 20),
        },
      ];

      testCases.forEach((testCase) => test(testCase, grid));
    });
  });
});
