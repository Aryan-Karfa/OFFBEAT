import type { Request, Response, NextFunction } from "express";
import { geographyService, type GeographyService } from "./geography.service.js";
import { sendSuccess } from "../../lib/http/response.js";

export class GeographyController {
  constructor(private service: GeographyService = geographyService) {}

  listCountries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const countries = await this.service.getCountries();
      sendSuccess(res, countries, 200);
    } catch (error) {
      next(error);
    }
  };

  getCountry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const country = await this.service.getCountryById(req.params.countryId as string);
      sendSuccess(res, country, 200);
    } catch (error) {
      next(error);
    }
  };

  getCountryRegions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const regions = await this.service.getCountryRegions(req.params.countryId as string);
      sendSuccess(res, regions, 200);
    } catch (error) {
      next(error);
    }
  };

  getRegion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const region = await this.service.getRegionById(req.params.regionId as string);
      sendSuccess(res, region, 200);
    } catch (error) {
      next(error);
    }
  };

  getRegionDestinations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const destinations = await this.service.getRegionDestinations(req.params.regionId as string);
      sendSuccess(res, destinations, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const geographyController = new GeographyController();
