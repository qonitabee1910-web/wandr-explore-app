/**
 * Vehicle Images & Metadata
 * Contains vehicle type information including images and display properties
 */

export const vehicleTypeImages: Record<string, { image: string; defaultImage: string; name: string }> = {
  'Mini Car': {
    name: 'Mini Car',
    image: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop',
    defaultImage: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop'
  },
  'SUV': {
    name: 'SUV',
    image: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop',
    defaultImage: 'https://images.unsplash.com/photo-1552519507-da3a142c6e3d?w=600&h=400&fit=crop'
  },
  'Hiace': {
    name: 'Hiace',
    image: 'https://images.unsplash.com/photo-1464219414925-bed2b42ac467?w=600&h=400&fit=crop',
    defaultImage: 'https://images.unsplash.com/photo-1464219414925-bed2b42ac467?w=600&h=400&fit=crop'
  }
};

/**
 * Get vehicle image by vehicle type
 */
export const getVehicleImage = (vehicleType: string | undefined): string | null => {
  if (!vehicleType) return null;
  const vehicle = vehicleTypeImages[vehicleType];
  return vehicle?.image || null;
};
