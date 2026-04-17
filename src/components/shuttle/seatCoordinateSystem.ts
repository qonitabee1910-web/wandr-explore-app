/**
 * Seat Layout Coordinate System
 * Centralized calculations to ensure admin editor and user shuttle display are identical
 */

/**
 * Shared constants for seat layout calculations
 * These values synchronize positioning between admin editor and user view
 */
export const SEAT_LAYOUT_CONSTANTS = {
  // Base dimensions (design reference)
  BASE_WIDTH: 800,
  BASE_HEIGHT: 600,
  GLOBAL_SCALE_DEFAULT: 1.0,
  
  // Display constraints (sync point between admin & user)
  MAX_DISPLAY_WIDTH: 600,
  
  // Rendering properties
  SEAT_BASE_SIZE: 32,  // px
  
  // Z-index layers
  Z_INDEX: {
    SEAT_DRAGGING: 1000,
    SEAT_SELECTED: 100,
    SEAT_DEFAULT: 10
  }
} as const;

/**
 * Calculate seat dimensions with responsive scaling
 * 
 * Formula: baseSeatSize = SEAT_BASE_SIZE × globalScale × ratio × seatDimension
 * Where: ratio = containerWidth / baseWidth
 * 
 * This ensures identical rendering in admin and user views
 * 
 * @param containerWidth - Actual rendered container width (px)
 * @param baseWidth - Design base width (default: 800px)
 * @param globalScale - Layout global scale factor (default: 1.0)
 * @param seatWidth - Individual seat width multiplier (default: 1.0)
 * @param seatLength - Individual seat length multiplier (default: 1.0)
 * @returns Object with calculated width, height, and scaling ratio
 */
export const calculateSeatDimensions = (
  containerWidth: number,
  baseWidth: number = SEAT_LAYOUT_CONSTANTS.BASE_WIDTH,
  globalScale: number = SEAT_LAYOUT_CONSTANTS.GLOBAL_SCALE_DEFAULT,
  seatWidth: number = 1.0,
  seatLength: number = 1.0
) => {
  // Key calculation: responsive ratio
  const ratio = containerWidth / baseWidth;
  
  // Apply ratio to seat dimensions
  const calculatedWidth = SEAT_LAYOUT_CONSTANTS.SEAT_BASE_SIZE * globalScale * ratio * seatWidth;
  const calculatedHeight = SEAT_LAYOUT_CONSTANTS.SEAT_BASE_SIZE * globalScale * ratio * seatLength;
  
  return {
    width: calculatedWidth,
    height: calculatedHeight,
    ratio,
    // Additional info for debugging
    formula: `${SEAT_LAYOUT_CONSTANTS.SEAT_BASE_SIZE} × ${globalScale} × ${ratio.toFixed(4)} × ${seatWidth}`
  };
};

/**
 * Normalize layout dimensions to ensure valid values
 */
export const normalizeLayoutDimensions = (layout: {
  base_width?: number;
  base_height?: number;
  global_scale?: number;
}) => ({
  base_width: layout.base_width || SEAT_LAYOUT_CONSTANTS.BASE_WIDTH,
  base_height: layout.base_height || SEAT_LAYOUT_CONSTANTS.BASE_HEIGHT,
  global_scale: layout.global_scale || SEAT_LAYOUT_CONSTANTS.GLOBAL_SCALE_DEFAULT
});

/**
 * Debug helper: Log seat calculation details
 */
export const debugSeatCalculation = (
  seatId: string,
  containerWidth: number,
  baseWidth: number,
  globalScale: number,
  seatWidth: number,
  seatLength: number
) => {
  const dims = calculateSeatDimensions(containerWidth, baseWidth, globalScale, seatWidth, seatLength);
  console.debug(`[SeatCoordinate] Seat ${seatId}:`, {
    containerWidth,
    baseWidth,
    ratio: dims.ratio.toFixed(4),
    globalScale,
    resultWidth: `${dims.width.toFixed(2)}px`,
    resultHeight: `${dims.height.toFixed(2)}px`,
    formula: dims.formula
  });
  return dims;
};
