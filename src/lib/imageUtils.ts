import osakaAptImage from "../assets/images/osaka_apartment_1781507657930.jpg";
import osakaHouseImage from "../assets/images/osaka_house_1781507817884.jpg";

export function getFallbackImage(listing: any, size: number = 600) {
  const isHouse = 
    listing.title?.includes("一戶建") || 
    listing.title?.includes("一戸建て") || 
    listing.title?.includes("別墅") ||
    listing.layout?.includes("一戶建") ||
    listing.layout?.includes("一戸建て");

  const isOsaka = listing.location?.includes("大阪") || listing.title?.includes("大阪");

  // House fallbacks
  if (isHouse) {
    if (isOsaka) {
      return osakaHouseImage;
    }
    // 1512917774080-9991f1c4c750 - Default House
    return `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=${size}`;
  }

  // Apartment fallbacks
  if (isOsaka) {
    return osakaAptImage;
  }
  
  // Tokyo/General apartment fallback
  return `https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=${size}`;
}
