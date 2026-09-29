export interface DetectedLocation {
  village: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<DetectedLocation> {
  // 1. Try OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village =
        addr.village ||
        addr.town ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.hamlet ||
        addr.city ||
        'Village / Area';
      const district =
        addr.state_district ||
        addr.county ||
        addr.district ||
        addr.city_district ||
        addr.city ||
        'District';
      const state = addr.state || 'State';
      const country = addr.country || 'India';

      return {
        village,
        district: district.replace(/ District/i, '').trim(),
        state: state.trim(),
        country,
        latitude: lat,
        longitude: lon,
        displayName: `${village}, ${district.replace(/ District/i, '')}, ${state}`,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode error, trying secondary source:', err);
  }

  // 2. Fallback to BigDataCloud client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const village = data.locality || data.city || 'Local Village';
      const district = (data.principalSubdivisionDescription || data.localityInfo?.administrative?.[2]?.name || 'District').replace(/ District/i, '');
      const state = data.principalSubdivision || 'State';
      return {
        village,
        district,
        state,
        country: data.countryName || 'India',
        latitude: lat,
        longitude: lon,
        displayName: `${village}, ${district}, ${state}`,
      };
    }
  } catch (err) {
    console.warn('Secondary reverse geocode error:', err);
  }

  // Fallback if network blocked
  return {
    village: 'Local Area',
    district: 'Detected Region',
    state: 'India',
    country: 'India',
    latitude: lat,
    longitude: lon,
    displayName: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
  };
}
