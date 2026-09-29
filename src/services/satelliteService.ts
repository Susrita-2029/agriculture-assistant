import agriData from '../data/agriData.json';
import { SatelliteData } from '../types';

/**
 * Satellite Observation Service
 * Architecture Note: In full deployment, this interface queries Google Earth Engine (GEE)
 * using the Earth Engine Python API or REST API endpoints to calculate Sentinel-2 MSI
 * (Copernicus) 10m-resolution NDVI, NDWI (Normalized Difference Water Index),
 * and thermal evapotranspiration stress.
 * Current implementation uses pre-calculated regional presets clearly marked as demo data.
 */
export interface SatelliteProvider {
  getIndices(state: string, district: string): Promise<SatelliteData>;
}

export class DemoSatelliteProvider implements SatelliteProvider {
  async getIndices(state: string, district: string): Promise<SatelliteData> {
    const stateInfo = (agriData.states as any)[state];
    if (stateInfo && stateInfo.satellitePresets && stateInfo.satellitePresets[district]) {
      return stateInfo.satellitePresets[district];
    }
    return {
      ndvi: 0.65,
      vegetation_health: "Normal",
      crop_stress: "Low",
      last_pass: "2026-09-28 (Sentinel-2 MSI Demo)"
    };
  }
}

export const satelliteService = new DemoSatelliteProvider();
