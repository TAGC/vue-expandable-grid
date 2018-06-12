import * as _ from "lodash";

export interface ICellPosition {
  readonly row: number;
  readonly column: number;
}

export interface ICell extends ICellPosition {
  readonly isAlive: boolean;
}

export class GridDimensions {
  constructor(
    readonly firstRow: number,
    readonly firstColumn: number,
    readonly lastRow: number,
    readonly lastColumn: number) {

  }
}

export type CellGenerationHandler = (liveCells: ICellPosition[]) => void;

export default class ConwayCalculator {
  private firstRow: number;
  private firstColumn: number;
  private grid: boolean[][];

  constructor(readonly habitability: number, readonly onCellsGenerated: CellGenerationHandler) {
    this.firstRow = 0;
    this.firstColumn = 0;
    this.grid = [];

    this.resize(new GridDimensions(0, 0, 0, 0));
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

  public toggleCellAtPosition(row: number, column: number) {
    const { row: iRow, column: iColumn } = this.fromLogicalRowAndColumn(row, column);

    if (iRow < 0 || iRow >= this.numberOfRows || iColumn < 0 || iColumn >= this.numberOfColumns) {
      return;
    }

    this.grid[iRow][iColumn] = !this.grid[iRow][iColumn];
    // this.publishCells([...this.getLiveCells()]);
  }

  public isCellAlive(row: number, column: number): boolean {
    const { row: iRow, column: iColumn } = this.fromLogicalRowAndColumn(row, column);

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

    const createRow = () => Array.from({ length: this.numberOfColumns }, () => this.trySpawnCell());

    const expandUpwards = () => this.grid.unshift(createRow());
    const expandDownwards = () => this.grid.push(createRow());
    const expandLeftwards = () => this.grid.forEach((row) => row.unshift(this.trySpawnCell()));
    const expandRightwards = () => this.grid.forEach((row) => row.push(this.trySpawnCell()));

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
      repeat(contractFromTop, firstRowDiff);
    } else {
      repeat(expandUpwards, -firstRowDiff);
    }

    if (lastRowDiff > 0) {
      repeat(expandDownwards, lastRowDiff);
    } else {
      repeat(contractFromBottom, -lastRowDiff);
    }

    if (firstColumnDiff > 0) {
      repeat(contractFromLeft, firstColumnDiff);
    } else {
      repeat(expandLeftwards, -firstColumnDiff);
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
    const dyingCells: ICellPosition[] = [];
    const revivingCells: ICellPosition[] = [];
    const nextGeneration: ICellPosition[] = [];
    const visitedDeadCells = new Set<number>();

    for (const cell of this.getLiveCells()) {
      const neighbours = [...this.getNeighbours(cell)];
      const deadNeighbours = _.filter(neighbours, (it) => !it.isAlive);

      if (this.shouldCellBeAlive(cell)) {
        nextGeneration.push(cell);
      } else {
        dyingCells.push(cell);
      }

      for (const deadNeighbour of deadNeighbours) {
        const positionHash = this.positionHashOfCell(deadNeighbour);

        if (visitedDeadCells.has(positionHash)) {
          continue;
        }

        if (this.shouldCellBeAlive(deadNeighbour)) {
          revivingCells.push(deadNeighbour);
          nextGeneration.push(deadNeighbour);
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

    this.publishCells(nextGeneration);
  }

  private publishCells(cells: ICellPosition[]) {
    const transform = (cell) => this.toLogicalRowAndColumn(cell.row, cell.column);

    this.onCellsGenerated(cells.map(transform));
  }

  private trySpawnCell() {
    return Math.random() < this.habitability;
  }

  private positionHashOfCell(cell: ICellPosition): number {
    return cell.row * this.numberOfRows + cell.column;
  }

  private fromLogicalRowAndColumn(row: number, column: number): { row: number, column: number } {
    return {
      row: row - this.firstRow,
      column: column - this.firstColumn,
    };
  }

  private toLogicalRowAndColumn(row: number, column: number): { row: number, column: number } {
    return {
      row: row + this.firstRow,
      column: column + this.firstColumn,
    };
  }

  private killCell({ row, column }: ICellPosition) {
    this.grid[row][column] = false;
  }

  private reviveCell({ row, column }: ICellPosition) {
    this.grid[row][column] = true;
  }

  private *getLiveCells(): IterableIterator<ICell> {
    for (let row = 0; row < this.numberOfRows; row++) {
      for (let column = 0; column < this.numberOfColumns; column++) {
        if (this.grid[row][column]) {
          yield { row, column, isAlive: true };
        }
      }
    }
  }

  private *getNeighbours({ row, column }: ICellPosition): IterableIterator<ICell> {
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

  private countLiveNeighbours(cell: ICell): number {
    const neighbours = [...this.getNeighbours(cell)];
    return _.sumBy(neighbours, (it) => it.isAlive ? 1 : 0);
  }

  private shouldCellBeAlive(cell: ICell): boolean {
    const liveNeighbours = this.countLiveNeighbours(cell);

    if (cell.isAlive) {
      return liveNeighbours === 2 || liveNeighbours === 3;
    } else {
      return liveNeighbours === 3;
    }
  }
}
