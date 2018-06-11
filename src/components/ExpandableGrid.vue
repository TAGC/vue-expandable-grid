<template>
  <div ref="container" :style ="containerStyleObject">
    <VirtualCollection
      ref="collection"
      :cellSizeAndPositionGetter="cellSizeAndPositionGetter"
      :collection="[...tiles, ...items]"
      :height="collectionSize.height"
      :width="collectionSize.width"
    >
      <div class="grid-cell" slot="cell" slot-scope="{data}">
        <slot v-if="data.isTile" name="grid-tile" :data="data">
          <DebugTile v-bind="data" :debug="data.key" />
        </slot>
        <div v-else-if="data.isDummy"/>
        <slot v-else name="grid-item" :data="data" />
      </div>
    </VirtualCollection>
    <resize-observer @notify="onResize" />
  </div>
</template>

<script lang="ts">
import * as _ from "lodash";
import { setTimeout } from "timers";
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import VueResize from "vue-resize";
import VirtualCollection from "vue-virtual-collection";
import ExtentCalculator, {
  Extent,
  ORIGIN,
  Position,
  Size,
  ZERO_EXTENT,
  ZERO_SIZE,
} from "./ExtentCalculator";
import { IGridClickEventArgs, IGridMouseMoveEventArgs } from "./GridEvents";
import GridManager from "./GridManager";
import ItemPositioner, { IGridItem } from "./ItemPositioner";
import ScrollManager, { IScrollEvent, ScrollSource } from "./ScrollManager";
import TileGenerator, { ITile } from "./TileGenerator";
import { DebugTile } from "./tiles";
import ZoomManager from "./ZoomManager";

// Plugin installation is idempotent.
Vue.use(VueResize);
Vue.use(VirtualCollection);

/**
 * A Vue component representing a grid that can be expanded indefinitely in all directions.
 */
@Component({ components: { DebugTile } })
export default class ExpandableGrid extends Vue {
  /**
   * The default length and width of grid tiles in logical grid coordinate space.
   */
  public static readonly defaultTileSize = 200;

  /**
   * The time (in milliseconds) between consecutive mousedown and mouseup events to consider it a
   * click.
   */
  private static readonly clickTimeout = 200;

  private collection: Element;
  private tileGenerator: TileGenerator;
  private itemPositioner: ItemPositioner;
  private scrollManager: ScrollManager;
  private zoomManager: ZoomManager;

  /**
   * The dimensions of the virtual-collection Vue component in *physical* grid coordinate space.
   */
  private collectionSize = ZERO_SIZE;

  /**
   * The extent of the viewport in physical grid coordinate space.
   */
  private physicalViewportExtent = ZERO_EXTENT;

  /**
   * The collection of grid tiles to render.
   */
  private tiles: ITile[] = [];

  /**
   * Represents whether the user is actively dragging the grid around.
   */
  private dragging = false;

  /**
   * The time that a mousedown event last occurred in the grid.
   *
   * Used to detect click events.
   */
  private lastMouseDown = 0;

  /**
   * Represents the current grid zoom level.
   */
  private zoomLevel = 1;

  /**
   * Represents the position on the grid that the mouse is focused at while zooming.
   *
   * This position is in logical grid coordinate space.
   */
  private zoomFocus = ORIGIN;

  /**
   * The collection of additional objects to place on the grid on top of the tiles.
   */
  @Prop({ default: () => [] })
  private items: IGridItem[];

  /**
   * The length and width of grid tiles in logical grid coordinate space.
   */
  @Prop({ default: ExpandableGrid.defaultTileSize })
  private tileSize: number;

  /**
   * The different possible levels that the grid can be zoomed in and out at.
   */
  @Prop({ default: () => new Set(_.range(8, 21).map((x) => x / 10)) })
  private zoomLevels: Set<number> | number[];

  /**
   * The forced minimum extent of the grid.
   */
  @Prop({default: () => ZERO_EXTENT})
  private minExtent: Extent;

  public mounted() {
    // Captures the dimensions of the root element before the VirtualCollection is mounted to
    // avoid including the scrollbar dimensions.
    this.collectionSize = { width: this.$el.clientWidth, height: this.$el.clientHeight };

    this.collection = (this.$refs.collection as any).$el as Element;
    this.collection.addEventListener("wheel", this.onGridWheeled);
    this.collection.addEventListener("mousedown", this.onGridMouseDown, { passive: true });
    this.collection.addEventListener("click", this.onGridClicked, { passive: true });
    this.collection.addEventListener("mousemove", this.onGridMouseMove, { passive: true });
    this.itemPositioner = new ItemPositioner();
    this.tileGenerator = new TileGenerator(this.tileSize, this.scaleTile, this.onTilesRegenerated);
    this.scrollManager = new ScrollManager(this.collection, this.onGridScrolled);
    this.zoomManager = new ZoomManager(new Set([...this.zoomLevels]), this.onZoomLevelChanged);

    Vue.nextTick(() => {
      this.onResize();
      this.updateViewportPosition((x) => x, (y) => y);
      this.itemPositioner.gridExtent = this.gridExtent;
      this.tileGenerator.gridExtent = this.gridExtent;
    });
  }

  /**
   * Gets the style to apply to the top-level DOM element.
   */
  private get containerStyleObject() {
    return {
      position: "absolute",
      height: "100%",
      width: "100%",
      cursor: this.dragging ? "move" : "default",
    };
  }

  /**
   * Gets the extent of the viewport in logical grid coordinate space.
   */
  private get logicalViewportExtent(): Extent {
    return ExtentCalculator.descaleExtent(this.physicalViewportExtent, this.zoomLevel);
  }

  /**
   * Gets the extent of the grid in logical grid coordinate space.
   */
  private get gridExtent(): Extent {
    return ExtentCalculator.calculateGridExtent(
      this.logicalViewportExtent,
      this.minExtent,
      this.items);
  }

  private cellSizeAndPositionGetter(object: IGridItem | ITile): Extent {
    let logicalExtent: Extent;

    if (this.tileGenerator.canManage(object)) {
      logicalExtent = this.tileGenerator.position(object);
    } else if (this.itemPositioner.canManage(object)) {
      logicalExtent = this.itemPositioner.position(object);
    } else {
      throw new Error(`Not a grid item or tile: ${JSON.stringify(object)}`);
    }

    // The logical extent needs to be transformed into physical grid coordinate space so that it's
    // placed correctly in the VirtualCollection.
    return ExtentCalculator.scaleExtent(logicalExtent, this.zoomLevel);
  }

  private onTilesRegenerated(tiles: ITile[]) {
    this.tiles = tiles;
  }

  private onZoomLevelChanged(zoomLevel: number) {
    this.zoomLevel = zoomLevel;
    this.tileGenerator.notifyZoomLevelChange();
    this.$emit("grid-zoomed", zoomLevel);
  }

  private onGridWheeled(e: WheelEvent) {
    e.preventDefault();

    if (e.ctrlKey) {
      this.handleZoom(e);
      return;
    }

    // Potentially make this customisable.
    const scrollSpeedModifier = 1;

    // Note that horizontal scrolling does not work very well in Electron.
    // See: https://github.com/electron/electron/issues/12997
    const deltaX = e.deltaX * scrollSpeedModifier;
    const deltaY = e.deltaY * scrollSpeedModifier;

    this.updateViewportPosition((x) => x + deltaX, (y) => y + deltaY);
  }

  private onGridMouseMove(e: MouseEvent) {
    const data: IGridMouseMoveEventArgs = this.toGridPosition({ x: e.clientX, y: e.clientY });

    if (this.isPositionInGrid(data)) {
      this.$emit("grid-mouse-moved", data);
    }
  }

  private onGridMouseDown(e: MouseEvent) {
    this.lastMouseDown = Date.now();
  }

  private onGridClicked(e: MouseEvent) {
    if (Date.now() - this.lastMouseDown > ExpandableGrid.clickTimeout) {
      return;
    }

    const data: IGridClickEventArgs = this.toGridPosition({x: e.clientX, y: e.clientY });

    if (this.isPositionInGrid(data)) {
      this.$emit("grid-clicked", data);
    }
  }

  private onGridScrolled(e: IScrollEvent) {
    switch (e.kind) {
      case "start":
        if (e.source === ScrollSource.Drag) {
          this.dragging = true;
        }
        break;

      case "stop":
        if (e.source === ScrollSource.Drag) {
          this.dragging = false;
        }
        break;

      case "change":
        this.updateViewportPosition((x) => x + e.delta.x, (y) => y + e.delta.y);
        break;
    }
  }

  private onResize() {
    this.collectionSize = { width: this.$el.clientWidth, height: this.$el.clientHeight };
    const collection = this.collection as any;
    const scrollbarWidth = collection.offsetWidth - collection.clientWidth;
    const scrollbarHeight = collection.offsetHeight - collection.clientHeight;
    this.physicalViewportExtent = Extent.resize(
      this.physicalViewportExtent,
      this.collectionSize.width - scrollbarWidth,
      this.collectionSize.height - scrollbarHeight);
  }

  @Watch("gridExtent")
  private onGridExtentChanged(extent: Extent, lastExtent: Extent) {
    if (_.isEqual(extent, lastExtent)) {
      return;
    }

    this.tileGenerator.gridExtent = extent;
    this.itemPositioner.gridExtent = extent;
  }

  @Watch("zoomLevel")
  private updateViewportPositionOnZoom(zoomLevel: number, lastZoomLevel: number) {
    const lastPhysicalZoomFocus = ExtentCalculator.scalePosition(this.zoomFocus, lastZoomLevel);
    const physicalZoomFocus = ExtentCalculator.scalePosition(this.zoomFocus, zoomLevel);
    const deltaZoomFocus = {
      x: physicalZoomFocus.x - lastPhysicalZoomFocus.x,
      y: physicalZoomFocus.y - lastPhysicalZoomFocus.y,
    };

    // Shifts the viewport so that the logical grid coordinate corresponding to
    // the zoom focus remains at the same physical location in the viewport.
    this.updateViewportPosition((x) => x + deltaZoomFocus.x, (y) => y + deltaZoomFocus.y);
  }

  private scaleTile(tileSize: number) {
    return this.zoomLevel * tileSize;
  }

  private handleZoom(e: WheelEvent) {
    this.zoomFocus = this.toGridPosition({ x: e.clientX, y: e.clientY });

    switch (Math.sign(e.deltaY)) {
      case 1:
        this.zoomManager.tryDecreaseZoom();
        break;

      case -1:
        this.zoomManager.tryIncreaseZoom();
        break;
    }
  }

  /**
   * Updates the position of the viewport.
   *
   * The viewport position is in physical grid coordinate space. The callbacks to update its
   * position should expect and return coordinates in physical grid coordinate space as well.
   */
  private updateViewportPosition(updateX: (x: number) => number, updateY: (y: number) => number) {
    this.physicalViewportExtent = Extent.reposition(
      this.physicalViewportExtent,
      updateX(this.physicalViewportExtent.x),
      updateY(this.physicalViewportExtent.y));

    const physicalGridExtent = ExtentCalculator.scaleExtent(this.gridExtent, this.zoomLevel);
    const scrollLeft = this.physicalViewportExtent.x - physicalGridExtent.x;
    const scrollTop = this.physicalViewportExtent.y - physicalGridExtent.y;

    Vue.nextTick(() => {
      this.scrollManager.scrollLeft = scrollLeft;
      this.scrollManager.scrollTop = scrollTop;
    });
  }

  /**
   * Returns whether a position is located within the actual grid.
   *
   * Positions on the grid scrollbars are excluded. The position is expected in
   * logical grid coordinate space.
   */
  private isPositionInGrid(position: Position): boolean {
    const { x, y, width, height } = this.logicalViewportExtent;

    return position.x - x <= width && position.y - y <= height;
  }

  /**
   * Converts a position in screen coordinates (such as from a mouse event) into logical grid
   * coordinate space with the origin at the top-left corner of the grid tile at row 0 and column 0.
   */
  private toGridPosition(position: Position): Position {
    const boundingRect = this.$el.getBoundingClientRect() as DOMRect;
    const viewport = this.logicalViewportExtent;

    // Translates coordinate space origin to grid.
    const physicalGridPosition = {
      x: position.x - boundingRect.x,
      y: position.y - boundingRect.y,
    };

    // Scales to account for grid zoom.
    const logicalCoordinates = ExtentCalculator.descalePosition(
      physicalGridPosition,
      this.zoomLevel,
    );

    // Translates to account for viewport location in grid.
    const gridCoordinates = {
      x: logicalCoordinates.x + viewport.x,
      y: logicalCoordinates.y + viewport.y,
    };

    return gridCoordinates;
  }
}
</script>

<style lang="scss" scoped>
.grid-cell {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>