/**
 * Represents the horizontal and vertical scrollbar positions.
 */
interface IScrollPositions {
  left: number;
  top: number;
}

/** Represents a change in the horizontal and vertical scrollbar positions. */
interface IScrollDelta {
  x: number;
  y: number;
}

/** Represents the mouse position. */
interface IMousePosition {
  x: number;
  y: number;
}

/**
 * Represents the position of an grid's scrollbars as percentages of their maximum values.
 */
export interface IScrollPercentages {
  percentAcross: number;
  percentDown: number;
}

/**
 * Enumerates the possible sources that a scroll event may be initiated from.
 */
export enum ScrollSource {
  Scrollbar,
  Pan,
}

/**
 * Represents the start of a grid scroll.
 */
export interface IScrollStartEvent {
  kind: "start";
  source: ScrollSource;
}

/**
 * Represents the end of a grid scroll.
 */
export interface IScrollStopEvent {
  kind: "stop";
  source: ScrollSource;
}

/**
 * Represents an intermediate stage of a grid scroll.
 */
export interface IScrollChangeEvent {
  kind: "change";
  source: ScrollSource;
  delta: IScrollDelta;
}

/**
 * Represents a grid scroll event.
 */
export type IScrollEvent = IScrollStartEvent | IScrollStopEvent | IScrollChangeEvent;

/**
 * Represents a callback that is invoked to handle a grid scroll event.
 */
export type IScrollEventHandler = (event: IScrollEvent) => void;

/**
 * A class for managing the scrolling logic for the grid.
 */
export default class ScrollManager {
  private mouseDown: boolean;
  private draggingScrollbar: boolean;
  private lastIScrollPositions: IScrollPositions;
  private lastMousePosition: IMousePosition;

  /**
   * Creates a new instance of ScrollManager.
   *
   * @param grid the DOM element representing the grid
   * @param onScrollChange the callback to invoke when a grid scroll event occurs
   */
  constructor(readonly grid: Element, readonly onScrollChange: IScrollEventHandler) {
    this.mouseDown = false;
    this.draggingScrollbar = false;
    this.lastIScrollPositions = this.currentIScrollPositions;
    this.lastMousePosition = { x: 0, y: 0 };

    grid.addEventListener("mousemove", (e) => this.onMouseMove(e as MouseEvent), { passive: true });
    grid.addEventListener("mousedown", (e) => this.onMouseDown(e as MouseEvent));
    grid.addEventListener("mouseup", (e) => this.onMouseUp(e as MouseEvent), { passive: true });
  }

  /**
   * Gets whether the scrollbar is currently being dragged.
   */
  get isDraggingScrollbar(): boolean {
    return this.draggingScrollbar;
  }

  /**
   * Gets the `scrollLeft` property of the grid.
   */
  get scrollLeft(): number {
    return this.grid.scrollLeft;
  }

  /**
   * Sets the `scrollLeft` property of the grid.
   */
  set scrollLeft(newLeft: number) {
    this.grid.scrollLeft = newLeft;
  }

  /**
   * Gets the `scrollTop` property of the grid.
   */
  get scrollTop(): number {
    return this.grid.scrollTop;
  }

  /**
   * Sets the `scrollTop` property of the grid.
   */
  set scrollTop(newTop: number) {
    this.grid.scrollTop = newTop;
  }

  private get currentIScrollPositions(): IScrollPositions {
    return { left: this.grid.scrollLeft, top: this.grid.scrollTop };
  }

  private get scrollbarWidth(): number {
    return (this.grid as any).offsetWidth - this.grid.clientWidth;
  }

  private get scrollbarHeight(): number {
    return (this.grid as any).offsetHeight - this.grid.clientHeight;
  }

  /**
   * Gets the percentage positions of the grid's scrollbars.
   *
   * @returns the vertical and horizontal scrollbar positions as percentages
   */
  public get scrollPercentages(): IScrollPercentages {
    const { left, top } = this.currentIScrollPositions;
    const scrollHeight = this.grid.scrollHeight;
    const scrollWidth = this.grid.scrollWidth;
    const percentDown = (top / (scrollHeight - this.grid.clientHeight)) * 100;
    const percentAcross = (left / (scrollWidth - this.grid.clientWidth)) * 100;

    return { percentDown, percentAcross };
  }

  /**
   * Sets the percentage position of the grid's vertical scrollbar.
   *
   * A percentage of 0% will scroll the grid to the top. A percentage of 100% will scroll the
   * grid to the bottom.
   *
   * @param percentage the percentage of the maximum position of the vertical scrollbar
   */
  public set scrollTopPercentage(percentage: number) {
    const scrollHeight = this.grid.scrollHeight;

    this.grid.scrollTop = (percentage / 100) * (scrollHeight - this.grid.clientHeight);
  }

  /**
   * Sets the percentage position of the grid's horizontal scrollbar.
   *
   * A percentage of 0% will scroll the grid to the left. A percentage of 100% will scroll the
   * grid to the right.
   *
   * @param percentage the percentage of the maximum position of the horizontal scrollbar
   */
  public set scrollLeftPercentage(percentage: number) {
    const scrollWidth = this.grid.scrollWidth;

    this.grid.scrollLeft = (percentage / 100) * (scrollWidth - this.grid.clientWidth);
  }

  /**
   * Scrolls the grid down by `amount`.
   *
   * If `amount` is positive, the grid is scrolled up.
   * @param amount the amount to vertically scroll the grid by in pixels
   */
  public scrollDown(amount: number) {
    this.grid.scrollTop += amount;
  }

  /**
   * Scrolls the grid right by `amount`.
   *
   * If `amount` is positive, the grid is scrolled left.
   * @param amount the amount to horizontally scroll the grid by in pixels
   */
  public scrollRight(amount: number) {
    this.grid.scrollLeft += amount;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.mouseDown) {
      return;
    }

    const deltaX = e.clientX - this.lastMousePosition.x;
    const deltaY = e.clientY - this.lastMousePosition.y;
    this.lastMousePosition = { x: e.clientX, y: e.clientY };

    // Allows the user to "grab" the grid and move it about. This is simulated by
    // making the grid scroll in the opposite direction to the mouse.
    this.onScrollChange({
      kind: "change",
      source: ScrollSource.Pan,
      delta: { x: -deltaX, y: -deltaY },
    });
  }

  private onMouseDown(e: MouseEvent) {
    this.mouseDown = true;

    if (this.pointOnScrollbar(e.clientX, e.clientY)) {
      this.draggingScrollbar = true;
    }

    this.onScrollChange({
      kind: "start",
      source: this.isDraggingScrollbar ? ScrollSource.Scrollbar : ScrollSource.Pan,
    });

    this.lastIScrollPositions = this.currentIScrollPositions;
    this.lastMousePosition = { x: e.clientX, y: e.clientY };

    // Allows mouse up events to be received even if the mouse is moved in-between.
    e.preventDefault();
  }

  private onMouseUp(e: MouseEvent) {
    this.mouseDown = false;

    if (this.draggingScrollbar) {
      this.draggingScrollbar = false;

      const { left: lastLeft, top: lastTop } = this.lastIScrollPositions;
      const { left: currLeft, top: currTop } = this.currentIScrollPositions;
      const x = currLeft - lastLeft;
      const y = currTop - lastTop;

      if (x === 0 && y === 0) {
        return;
      }

      this.onScrollChange({
        kind: "change",
        source: ScrollSource.Scrollbar,
        delta: { x, y },
      });

      this.onScrollChange({
        kind: "stop",
        source: ScrollSource.Scrollbar,
      });
    } else {
      this.onScrollChange({
        kind: "stop",
        source: ScrollSource.Pan,
      });
    }
  }

  private pointOnScrollbar(x: number, y: number): boolean {
    const boundingRect = this.grid.getBoundingClientRect() as DOMRect;
    const localX = x - boundingRect.x;
    const localY = y - boundingRect.y;

    const pointOnHorizontalScrollbar = localX > boundingRect.width - this.scrollbarWidth;
    const pointOnVerticalScrollbar = localY > boundingRect.height - this.scrollbarHeight;

    return pointOnHorizontalScrollbar || pointOnVerticalScrollbar;
  }
}
