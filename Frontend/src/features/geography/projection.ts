import type { Region } from "../../types/geography";

export const MAP_VIEWBOX = {
  width: 800,
  height: 920,
  viewBox: "0 0 800 920",
};

export interface CameraTransform {
  translateX: number;
  translateY: number;
  scale: number;
  transform: string;
}

/**
 * Calculates smooth pan & zoom framing centered on the selected region's actual bounding box.
 * Avoids arbitrary manual coordinate offsets and scales smaller/larger states intelligently.
 */
export function calculateRegionCamera(region: Region, manualZoom = 1): CameraTransform {
  // Use pre-projected bounds if available
  const bounds = region.projectedBounds;
  const centroid = region.projectedCentroid || [400, 460];

  if (!bounds || bounds.length !== 2) {
    // Fallback using projected centroid or default coordinates
    const scale = Math.max(1.8, 2.2 * manualZoom);
    const translateX = 400 - centroid[0] * scale;
    const translateY = 460 - centroid[1] * scale;
    return {
      translateX,
      translateY,
      scale,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    };
  }

  const [min, max] = bounds;
  const width = Math.max(20, max[0] - min[0]);
  const height = Math.max(20, max[1] - min[1]);
  const centerX = centroid[0];
  const centerY = centroid[1];

  // Dynamic zoom fitting: smaller states/UTs zoom in more, large states zoom out appropriately
  // Leave comfortable margin so neighboring geographic context remains visible
  const horizontalZoom = (MAP_VIEWBOX.width * 0.48) / width;
  const verticalZoom = (MAP_VIEWBOX.height * 0.48) / height;
  const naturalZoom = Math.min(horizontalZoom, verticalZoom);

  // Clamp zoom between 1.6x (huge states like Rajasthan/Ladakh) and 3.8x (tiny UTs/Goa)
  const clampedScale = Math.min(3.8, Math.max(1.6, naturalZoom)) * manualZoom;

  // Center on the region's geographic centroid within the 800x920 viewport
  const translateX = Math.round((MAP_VIEWBOX.width / 2 - centerX * clampedScale) * 10) / 10;
  const translateY = Math.round((MAP_VIEWBOX.height / 2 - centerY * clampedScale) * 10) / 10;

  return {
    translateX,
    translateY,
    scale: clampedScale,
    transform: `translate(${translateX}px, ${translateY}px) scale(${clampedScale})`,
  };
}

/**
 * Retrieves the 2D SVG canvas anchor point for a region.
 */
export function getRegionCoordinates(region: Region): { x: number; y: number } {
  if (region.projectedCentroid && region.projectedCentroid.length === 2) {
    return {
      x: region.projectedCentroid[0],
      y: region.projectedCentroid[1],
    };
  }
  return { x: 400, y: 460 };
}
