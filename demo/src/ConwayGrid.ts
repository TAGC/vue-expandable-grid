import * as _ from "lodash";

class Cell {
  public readonly row: number;
  public readonly column: number;
  public readonly isAlive: boolean;
}

export class GridDimensions {
  constructor(
    readonly firstRow: number,
    readonly firstColumn: number,
    readonly lastRow: number,
    readonly lastColumn: number) {

  }
}

export default class ConwayGrid {
  private firstRow: number;
  private firstColumn: number;
  private grid: boolean[][];
  private habitability = 0.2;

  constructor(initialDimensions: GridDimensions) {
    this.firstRow = 0;
    this.firstColumn = 0;
    this.grid = [[]];

    this.resize(initialDimensions);
    this.spawnRandomCells();
  }

  private get numberOfRows(): number {
    return this.grid.length;
  }

  private get numberOfColumns(): number {
    return this.grid.length > 0 ? this.grid[0].length : 0;
  }

  private get lastRow(): number {
    return this.firstRow + this.numberOfRows;
  }

  private get lastColumn(): number {
    return this.firstColumn + this.numberOfColumns;
  }

  public liveCellAt(row: number, column: number): boolean {
    const { row: iRow, column: iColumn } = this.toGridIndices(row, column);

    if (iRow < 0 || iRow >= this.numberOfRows || iColumn < 0 || iColumn >= this.numberOfColumns) {
      return false;
    }

    return this.grid[iRow][iColumn];
  }

  public resize(newDimensions: GridDimensions) {
    const firstRowDiff = newDimensions.firstRow - this.firstRow;
    const firstColumnDiff = newDimensions.firstColumn - this.firstColumn;
    const lastRowDiff = newDimensions.lastRow - this.lastRow;
    const lastColumnDiff = newDimensions.lastColumn - this.lastColumn;

    const createRow = () => Array.from({ length: this.numberOfColumns }, () => false);

    const expandUpwards = () => this.grid.unshift(createRow());
    const expandDownwards = () => this.grid.push(createRow());
    const expandLeftwards = () => this.grid.forEach((row) => row.unshift(false));
    const expandRightwards = () => this.grid.forEach((row) => row.push(false));

    const contractFromTop = () => this.grid.shift();
    const contractFromBottom = () => this.grid.pop();
    const contractFromLeft = () => this.grid.forEach((row) => row.shift());
    const contractFromRight = () => this.grid.forEach((row) => row.pop());

    const repeat = (f: () => void, n: number) => {
      for (let i = 0; i < n; i++) {
        f();
      }
    };

    if (firstRowDiff > 0) {
      repeat(expandUpwards, firstRowDiff);
    } else {
      repeat(contractFromTop, -firstRowDiff);
    }

    if (lastRowDiff > 0) {
      repeat(expandDownwards, lastRowDiff);
    } else {
      repeat(contractFromBottom, -lastRowDiff);
    }

    if (firstColumnDiff > 0) {
      repeat(expandLeftwards, firstColumnDiff);
    } else {
      repeat(contractFromLeft, -firstColumnDiff);
    }

    if (lastColumnDiff > 0) {
      repeat(expandRightwards, lastColumnDiff);
    } else {
      repeat(contractFromRight, -lastColumnDiff);
    }

    this.firstRow = newDimensions.firstRow;
    this.firstColumn = newDimensions.firstColumn;
  }

  public nextGeneration() {
    const dyingCells: Cell[] = [];
    const revivingCells: Cell[] = [];
    const visitedDeadCells = new Set<number>();

    for (const cell of this.getLiveCells()) {
      const neighbours = [...this.getNeighbours(cell)];
      const deadNeighbours = _.filter(neighbours, (it) => !it.isAlive);

      if (!this.shouldCellBeAlive(cell)) {
        dyingCells.push(cell);
      }

      for (const deadNeighbour of deadNeighbours) {
        const positionHash = this.positionHashOfCell(deadNeighbour);

        if (visitedDeadCells.has(positionHash)) {
          continue;
        }

        if (this.shouldCellBeAlive(deadNeighbour)) {
          revivingCells.push(deadNeighbour);
        }

        visitedDeadCells.add(positionHash);
      }
    }

    for (const cell of dyingCells) {
      this.killCell(cell);
    }

    for (const cell of revivingCells) {
      this.reviveCell(cell);
    }
  }

  private positionHashOfCell(cell: Cell): number {
    return cell.row * this.numberOfRows + cell.column;
  }

  private toGridIndices(row: number, column: number): { row: number, column: number } {
    return {
      row: row - this.firstRow,
      column: column - this.firstColumn,
    };
  }

  private killCell({ row, column }: Cell) {
    this.grid[row][column] = false;
  }

  private reviveCell({ row, column }: Cell) {
    this.grid[row][column] = true;
  }

  private spawnRandomCells() {
    const trySpawn = () => Math.random() < this.habitability;

    for (let row = 0; row < this.numberOfRows; row++) {
      for (let column = 0; column < this.numberOfColumns; column++) {
        this.grid[row][column] = trySpawn();
      }
    }
  }

  private *getLiveCells(): IterableIterator<Cell> {
    for (let row = 0; row < this.numberOfRows; row++) {
      for (let column = 0; column < this.numberOfColumns; column++) {
        if (this.grid[row][column]) {
          yield { row, column, isAlive: true };
        }
      }
    }
  }

  private *getNeighbours({ row, column }: Cell): IterableIterator<Cell> {
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = column - 1; j <= column + 1; j++) {
        if (i === row && j === column) {
          continue;
        }

        if (i < 0 || i >= this.numberOfRows || j < 0 || j >= this.numberOfColumns) {
          continue;
        }

        yield { row: i, column: j, isAlive: this.grid[i][j] };
      }
    }
  }

  private countLiveNeighbours(cell: Cell): number {
    const neighbours = [...this.getNeighbours(cell)];
    return _.sumBy(neighbours, (it) => it.isAlive ? 1 : 0);
  }

  private shouldCellBeAlive(cell: Cell): boolean {
    const liveNeighbours = this.countLiveNeighbours(cell);

    if (cell.isAlive) {
      return liveNeighbours === 2 || liveNeighbours === 3;
    } else {
      return liveNeighbours === 3;
    }
  }
}
