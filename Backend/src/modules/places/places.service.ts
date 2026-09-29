import { placeRepository, type PlaceRepository } from "./places.repository.js";
import type { PlaceDetailDto, PlaceCategoryDto, PlaceWithDetails } from "./places.types.js";
import { NotFoundError } from "../../lib/errors/AppError.js";

export class PlaceService {
  constructor(private repo: PlaceRepository = placeRepository) {}

  async getPlaceById(identifier: string): Promise<PlaceDetailDto> {
    const place = await this.repo.findPlaceByIdOrSlug(identifier);
    if (!place) {
      throw new NotFoundError(`Place with identifier '${identifier}' not found`);
    }

    return this.mapPlaceToDto(place);
  }

  async getCategories(): Promise<PlaceCategoryDto[]> {
    const categories = await this.repo.findAllCategories();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  }

  private mapPlaceToDto(place: PlaceWithDetails): PlaceDetailDto {
    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      destination: place.destination.name,
      categories: place.categories.map((c) => c.category.name),
      location: {
        lat: place.latitude,
        lng: place.longitude,
      },
      description: place.description,
      address: place.address,
      website: place.website,
      phone: place.phone,
      imageUrl: place.imageUrl,
      status: place.status,
    };
  }
}

export const placeService = new PlaceService();
