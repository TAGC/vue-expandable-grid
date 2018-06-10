import ZoomManager from "@/components/ZoomManager";
import { expect } from "chai";

describe("ZoomManager", () => {
  let zoomLevel: number | null = null;
  const validZoomLevels = new Set([0.5, 1, 1.5]);
  const invalidZoomLevels = new Set([0.5, 1.5]);
  const onZoomChange = (newZoomLevel) => zoomLevel = newZoomLevel;
  const createZoomManager = (zoomLevels) => new ZoomManager(zoomLevels, onZoomChange);

  before(() => {
    zoomLevel = null;
  });

  it("constructs successfully if zoom levels set contains zoom level of 1", () => {
    expect(() => createZoomManager(validZoomLevels));
  });

  it("throws an exception if zoom levels set does not contain zoom level of 1", () => {
    expect(() => createZoomManager(invalidZoomLevels));
  });

  it("publishes default zoom level (1) after construction", () => {
    const _ = createZoomManager(validZoomLevels);
    expect(zoomLevel).to.equal(1);
  });

  it("increases zoom level on request when current zoom level below maximum", () => {
    const zoomManager = createZoomManager(validZoomLevels);
    zoomManager.tryIncreaseZoom();
    expect(zoomLevel).to.equal(1.5);
  });

  it("decreases zoom level on request when current zoom level above minimum", () => {
    const zoomManager = createZoomManager(validZoomLevels);
    zoomManager.tryDecreaseZoom();
    expect(zoomLevel).to.equal(0.5);
  });

  it("does not permit increasing zoom level above maximum", () => {
    const zoomManager = createZoomManager(validZoomLevels);
    zoomManager.tryIncreaseZoom();
    zoomManager.tryIncreaseZoom();
    expect(zoomLevel).to.equal(1.5);
  });

  it("does not permit decreasing zoom level below minimum", () => {
    const zoomManager = createZoomManager(validZoomLevels);
    zoomManager.tryDecreaseZoom();
    zoomManager.tryDecreaseZoom();
    expect(zoomLevel).to.equal(0.5);
  });
});
