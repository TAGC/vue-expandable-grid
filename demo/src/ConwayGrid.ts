import * as _ from "lodash";

class Cell {
  constructor(readonly row: number, readonly column: number) {

  }
}

export class GridDimensions {
  constructor(
    readonly firstRow: number,
    readonly firstColumn: number,
    readonly numberOfRows: number,
    readonly numberOfColumns: number) {

  }
}

export default class ConwayGrid {
  private gridDimensions: GridDimensions;
  private grid: Cell[];

  constructor(initialDimensions: GridDimensions) {
    this.grid = [];
    this.resize(initialDimensions);
    this.spawnRandomCells(0.2);
  }

  private get rows(): number[] {
    const { firstRow, numberOfRows } = this.gridDimensions;
    return _.range(firstRow, numberOfRows);
  }

  private get columns(): number[] {
    const { firstColumn, numberOfColumns } = this.gridDimensions;
    return _.range(firstColumn, numberOfColumns);
  }

  public liveCellAt(row: number, column: number): boolean {
    return _.some(this.grid, new Cell(row, column));
  }

  public nextGeneration() {
    if (this.grid.length === 0) {
      this.spawnRandomCells(0.2);
    }

    this.grid = [...this.getNextGeneration()];
  }

  public resize(newDimensions: GridDimensions) {
    this.gridDimensions = newDimensions;

    const newRows = this.rows;
    const newColumns = this.columns;

    // Remove cells not within new grid dimensions.
    _.remove(this.grid, ({ row, column }) => {
      return !_.includes(newRows, row) || !_.includes(newColumns, column);
    });
  }

  private spawnRandomCells(habitability: number) {
    const spawn = () => Math.random() < habitability;

    this.grid = [];

    for (const row of this.rows) {
      for (const column of this.columns) {
        if (spawn()) {
          this.grid.push(new Cell(row, column));
        }
      }
    }
  }

  private isAlive(cell: Cell): boolean {
    return _.some(this.grid, cell);
  }

  private countLiveNeighbours(cell: Cell): number {
    let liveNeighbours = 0;

    for (const row of _.range(cell.row - 1, cell.row + 2)) {
      for (const column of _.range(cell.column - 1, cell.column + 2)) {
        if (row === cell.row && column === cell.column) {
          continue;
        }

        if (!this.isAlive({row, column})) {
          continue;
        }

        liveNeighbours++;
      }
    }

    return liveNeighbours;
  }

  private *getNextGeneration(): IterableIterator<Cell> {
    // tslint:disable-next-line:no-console
    console.log(this.grid.length, this.rows.length * this.columns.length);
    for (const row of this.rows) {
      for (const column of this.columns) {
        const cell = new Cell(row, column);
        const cellIsAlive = this.isAlive(cell);
        // const liveNeighbours = this.countLiveNeighbours(cell);
        const liveNeighbours: number = 5;

        switch (liveNeighbours) {
          // Cell dies or remains dead due to underpopulation.
          case 0:
          case 1:
            continue;

          // Cell continues to live if (and only if) already alive.
          case 2:
            if (cellIsAlive) {
              yield cell;
            }
            continue;

          // Cell remains alive or becomes alive through reproduction.
          case 3:
            yield cell;
            continue;

          // Cell dies or remains dead due to overpopulation.
          default:
            continue;
        }
      }
    }
  }
}
