import { filter, sumBy } from "lodash";

interface ILogicalCellPosition {
  readonly row: number;
  readonly column: number;
}

interface IPhysicalCellPosition {
  readonly iRow: number;
  readonly iColumn: number;
}

interface ILogicalCell extends ILogicalCellPosition {
  readonly isAlive: boolean;
}

interface IPhysicalCell extends IPhysicalCellPosition {
  readonly isAlive: boolean;
}

export type ICellPosition = ILogicalCellPosition;
export type ICell = ILogicalCell;
export type CellGenerationHandler = (liveCells: ILogicalCellPosition[]) => void;

export class GridDimensions {
  constructor(
    readonly firstRow: number,
    readonly firstColumn: number,
    readonly lastRow: number,
    readonly lastColumn: number) {

  }
}

export default class ConwayCalculator {
  public habitability: number;

  private readonly deadPositions: ILogicalCellPosition[];
  private firstRow: number;
  private firstColumn: number;
  private grid: boolean[][];

  constructor(
    readonly onCellsGenerated: CellGenerationHandler,
    deadZones: GridDimensions[] = []) {
    this.firstRow = 0;
    this.firstColumn = 0;
    this.grid = [];
    this.deadPositions = [];

    for (const deadZone of deadZones) {
      for (let row = deadZone.firstRow; row < deadZone.lastRow; row++) {
        for (let column = deadZone.firstColumn; column < deadZone.lastColumn; column++) {
          const position = { row, column };

          if (!this.isCellPositionInDeadZone(position)) {
            this.deadPositions.push(position);
          }
        }
      }
    }

    Object.freeze(this.deadPositions);
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

  public toggleCellAtPosition(position: ILogicalCellPosition) {
    const { iRow, iColumn } = this.fromLogicalPosition(position);

    if (!this.positionIsInGrid({ iRow, iColumn })) {
      return;
    }

    this.grid[iRow][iColumn] = !this.grid[iRow][iColumn];
  }

  public isCellAlive(position: ILogicalCellPosition): boolean {
    const { iRow, iColumn } = this.fromLogicalPosition(position);

    if (!this.positionIsInGrid({ iRow, iColumn })) {
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
    this.killCellsInDeadZones();
  }

  public nextGeneration() {
    const dyingCells: IPhysicalCellPosition[] = [];
    const revivingCells: IPhysicalCellPosition[] = [];
    const nextGeneration: IPhysicalCellPosition[] = [];
    const visitedDeadCells = new Set<number>();

    for (const cell of this.getLiveCells()) {
      const neighbours = [...this.getNeighbours(cell)];
      const deadNeighbours = filter(neighbours, (it) => !it.isAlive);

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

  private publishCells(cells: IPhysicalCellPosition[]) {
    const transformCoordinates = (cell) => this.toLogicalPosition(cell);

    this.onCellsGenerated(cells.map(transformCoordinates));
  }

  private trySpawnCell() {
    return Math.random() < this.habitability;
  }

  private positionHashOfCell(cell: IPhysicalCellPosition): number {
    return cell.iRow * this.numberOfRows + cell.iColumn;
  }

  private fromLogicalPosition({ row, column }: ILogicalCellPosition): IPhysicalCellPosition {
    const iRow = row - this.firstRow;
    const iColumn = column - this.firstColumn;

    return { iRow, iColumn };
  }

  private positionIsInGrid({ iRow, iColumn }: IPhysicalCellPosition): boolean {
    const validRow = 0 <= iRow && iRow < this.numberOfRows;
    const validColumn =  0 <= iColumn && iColumn < this.numberOfColumns;
    return validRow && validColumn;
  }

  private toLogicalPosition({ iRow, iColumn }: IPhysicalCellPosition): ILogicalCellPosition {
    return {
      row: iRow + this.firstRow,
      column: iColumn + this.firstColumn,
    };
  }

  private killCell({ iRow, iColumn }: IPhysicalCellPosition) {
    this.grid[iRow][iColumn] = false;
  }

  private reviveCell({ iRow, iColumn }: IPhysicalCellPosition) {
    this.grid[iRow][iColumn] = true;
  }

  private *getLiveCells(): IterableIterator<IPhysicalCell> {
    for (let iRow = 0; iRow < this.numberOfRows; iRow++) {
      for (let iColumn = 0; iColumn < this.numberOfColumns; iColumn++) {
        if (this.grid[iRow][iColumn]) {
          yield { iRow, iColumn, isAlive: true };
        }
      }
    }
  }

  private *getNeighbours({ iRow, iColumn }: IPhysicalCellPosition):
    IterableIterator<IPhysicalCell> {
    for (let i = iRow - 1; i <= iRow + 1; i++) {
      for (let j = iColumn - 1; j <= iColumn + 1; j++) {
        if (i === iRow && j === iColumn) {
          continue;
        }

        if (i < 0 || i >= this.numberOfRows || j < 0 || j >= this.numberOfColumns) {
          continue;
        }

        yield { iRow: i, iColumn: j, isAlive: this.grid[i][j] };
      }
    }
  }

  private countLiveNeighbours(cell: IPhysicalCell): number {
    const neighbours = [...this.getNeighbours(cell)];
    return sumBy(neighbours, (it) => it.isAlive ? 1 : 0);
  }

  private shouldCellBeAlive(cell: IPhysicalCell): boolean {
    const liveNeighbours = this.countLiveNeighbours(cell);
    const logicalPosition = this.toLogicalPosition(cell);

    if (this.isCellPositionInDeadZone(logicalPosition)) {
      return false;
    } else if (cell.isAlive) {
      return liveNeighbours === 2 || liveNeighbours === 3;
    } else {
      return liveNeighbours === 3;
    }
  }

  private killCellsInDeadZones() {
    for (const position of this.deadPositions) {
      const physicalPosition = this.fromLogicalPosition(position);

      if (this.positionIsInGrid(physicalPosition)) {
        this.killCell(physicalPosition);
      }
    }
  }

  private isCellPositionInDeadZone({ column, row }: ILogicalCellPosition): boolean {
    for (const { row: deadRow, column: deadColumn } of this.deadPositions) {
      if (row === deadRow && column === deadColumn) {
        return true;
      }
    }

    return false;
  }
}
