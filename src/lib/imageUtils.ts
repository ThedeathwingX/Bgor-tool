const osakaHouseImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600";
const osakaAptImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600";
const kyotoMachiyaImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600";

export function getFallbackImage(listing: any, size: number = 600) {
  const isTraditional = 
    listing.title?.includes("町家") || 
    listing.title?.includes("古民家") || 
    listing.layout?.includes("町家");

  const isHouse = 
    listing.propertyType === "house" ||
    listing.title?.includes("一戶建") || 
    listing.title?.includes("一戸建て") || 
    listing.title?.includes("別墅") ||
    listing.layout?.includes("一戶建") ||
    listing.layout?.includes("一戸建て");

  const isOsaka = listing.location?.includes("大阪") || listing.title?.includes("大阪");
  const isKyoto = listing.location?.includes("京都") || listing.title?.includes("京都");

  // Traditional Kyoto Machiya fallback
  if (isTraditional && isKyoto) {
    return kyotoMachiyaImage;
  }

  // House fallbacks
  if (isHouse) {
    if (isOsaka) {
      return osakaHouseImage;
    }
    // Default House
    return `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=${size}`;
  }

  // Apartment fallbacks
  if (isOsaka) {
    return osakaAptImage;
  }
  
  // Tokyo/General apartment fallback
  return `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=${size}`;
}
