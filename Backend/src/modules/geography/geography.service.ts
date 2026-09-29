import { geographyRepository, type GeographyRepository } from "./geography.repository.js";
import type {
  CountryDto,
  CountryWithRegionsDto,
  RegionSummaryDto,
  RegionDetailDto,
  DestinationSummaryDto,
  GeoLocation,
} from "./geography.types.js";
import { NotFoundError } from "../../lib/errors/AppError.js";
import type { Country, Region, Destination } from "@prisma/client";

export class GeographyService {
  constructor(private repo: GeographyRepository = geographyRepository) {}

  async getCountries(): Promise<CountryDto[]> {
    const countries = await this.repo.findAllCountries();
    return countries.map((c) => this.mapCountryToDto(c));
  }

  async getCountryById(identifier: string): Promise<CountryWithRegionsDto> {
    const country = await this.repo.findCountryWithRegions(identifier);
    if (!country) {
      throw new NotFoundError(`Country with identifier '${identifier}' not found`);
    }

    return {
      ...this.mapCountryToDto(country),
      regions: country.regions.map((r) => this.mapRegionToSummaryDto(r)),
    };
  }

  async getCountryRegions(identifier: string): Promise<RegionSummaryDto[]> {
    const regions = await this.repo.findRegionsByCountryIdOrSlug(identifier);
    if (regions === null) {
      throw new NotFoundError(`Country with identifier '${identifier}' not found`);
    }

    return regions.map((r) => this.mapRegionToSummaryDto(r));
  }

  async getRegionById(identifier: string): Promise<RegionDetailDto> {
    const region = await this.repo.findRegionByIdOrSlug(identifier);
    if (!region) {
      throw new NotFoundError(`Region with identifier '${identifier}' not found`);
    }

    return {
      id: region.id,
      name: region.name,
      code: region.code,
      type: region.type,
      slug: region.slug,
      description: region.description,
      centroid: region.centroid as unknown as GeoLocation,
    };
  }

  async getRegionDestinations(identifier: string): Promise<DestinationSummaryDto[]> {
    const destinations = await this.repo.findDestinationsByRegion(identifier);
    if (destinations === null) {
      throw new NotFoundError(`Region with identifier '${identifier}' not found`);
    }

    return destinations.map((d) => this.mapDestinationToSummaryDto(d));
  }

  private mapCountryToDto(country: Country): CountryDto {
    return {
      id: country.id,
      name: country.name,
      code: country.code,
      slug: country.slug,
      geometry: country.geometry,
    };
  }

  private mapRegionToSummaryDto(region: Region): RegionSummaryDto {
    return {
      id: region.id,
      name: region.name,
      code: region.code,
      type: region.type,
      slug: region.slug,
      geometry: region.geometry,
      centroid: region.centroid as unknown as GeoLocation,
    };
  }

  private mapDestinationToSummaryDto(destination: Destination): DestinationSummaryDto {
    return {
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      description: destination.description,
      coordinates: destination.coordinates as unknown as GeoLocation | null,
      imageUrl: destination.imageUrl,
      status: destination.status,
    };
  }
}

export const geographyService = new GeographyService();
