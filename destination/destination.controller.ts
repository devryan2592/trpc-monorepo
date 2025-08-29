import { Request, Response } from "express";
import { ApiResponse } from "@/types/api-response.types";
import { sendError, sendSuccess, sendZodError } from "@/utils/api-response";
import { catchAsync } from "@/utils/catch-async";
import {
  createDestination,
  deleteDestination,
  getDestinationById,
  getAllDestinations,
  updateDestination,
} from "./destination.service";
import {
  CreateDestinationResponseType,
  UpdateDestinationResponseType,
  GetDestinationResponseType,
  GetDestinationsResponseType,
  DeleteDestinationResponseType,
} from "./destination.types";
import {
  createDestinationSchema,
  updateDestinationSchema,
  getDestinationByIdSchema,
  deleteDestinationSchema,
  getAllDestinationsSchema,
} from "./destination.schema";
import HTTP_STATUS from "@/constants/http-status";

/**
 * Creates a new destination
 * @description Creates a new destination with associated cities, images, and FAQs
 * @route POST /api/destinations
 * @param {Request} req - Express request object containing destination data in body
 * @param {Response<ApiResponse<CreateDestinationResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with created destination data
 * @throws {400} Bad Request - Invalid input data
 * @throws {409} Conflict - Destination already exists
 * @throws {500} Internal Server Error - Database or file operation failure
 */
export const createDestinationController = catchAsync(
  async (
    req: Request,
    res: Response<ApiResponse<CreateDestinationResponseType>>
  ) => {
    const { data, success, error } = createDestinationSchema.safeParse(
      req.body
    );

    if (!success) return sendZodError(res, error);

    const destination = await createDestination(data);

    return sendSuccess(
      res,
      HTTP_STATUS.CREATED,
      "Destination created successfully",
      { destination }
    );
  }
);

/**
 * Updates an existing destination
 * @description Updates destination information including cities, images, and FAQs
 * @route PUT /api/destinations/:id
 * @param {Request} req - Express request object with destination ID in params and update data in body
 * @param {Response<ApiResponse<UpdateDestinationResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with updated destination data
 * @throws {400} Bad Request - Invalid input data
 * @throws {404} Not Found - Destination does not exist
 * @throws {500} Internal Server Error - Database or file operation failure
 */
export const updateDestinationController = catchAsync(
  async (
    req: Request,
    res: Response<ApiResponse<UpdateDestinationResponseType>>
  ) => {
    const { id } = req.params;

    const requestData = {
      ...req.body,
      id,
    };

    const { data, success, error } =
      updateDestinationSchema.safeParse(requestData);

    if (!success) return sendZodError(res, error);

    const destination = await updateDestination(data);

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Destination updated successfully",
      { destination }
    );
  }
);

/**
 * Deletes a destination
 * @description Removes a destination and all associated data from the database
 * @route DELETE /api/destinations/:id
 * @param {Request} req - Express request object with destination ID in params
 * @param {Response<ApiResponse<DeleteDestinationResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response confirming deletion
 * @throws {400} Bad Request - Invalid destination ID
 * @throws {404} Not Found - Destination does not exist
 * @throws {500} Internal Server Error - Database operation failure
 */
export const deleteDestinationController = catchAsync(
  async (
    req: Request,
    res: Response<ApiResponse<DeleteDestinationResponseType>>
  ) => {
    const { id } = req.params;
    const { success, error } = deleteDestinationSchema.safeParse({ id });

    if (!success) return sendZodError(res, error);

    const result = await deleteDestination(id);

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Destination deleted successfully",
      result
    );
  }
);

/**
 * Retrieves all destinations
 * @description Fetches all destinations with optional search functionality
 * @route GET /api/destinations
 * @param {Request} req - Express request object with optional query parameters
 * @param {Response<ApiResponse<GetDestinationsResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with destinations data
 * @throws {400} Bad Request - Invalid query parameters
 * @throws {500} Internal Server Error - Database query failure
 */
export const getAllDestinationsController = catchAsync(
  async (
    req: Request,
    res: Response<ApiResponse<GetDestinationsResponseType>>
  ) => {
    const { success, error, data } = getAllDestinationsSchema.safeParse(req.query);

    if (!success) return sendZodError(res, error);

    const destinations = await getAllDestinations(data.q || "");

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Destinations retrieved successfully",
      { destinations }
    );
  }
);

/**
 * Retrieves a specific destination by ID
 * @description Fetches a single destination by its unique identifier including all associated data
 * @route GET /api/destinations/:id
 * @param {Request} req - Express request object with destination ID in params
 * @param {Response<ApiResponse<GetDestinationResponseType>>} res - Express response object
 * @returns {Promise<Response>} Success response with destination data
 * @throws {400} Bad Request - Invalid destination ID
 * @throws {404} Not Found - Destination does not exist
 * @throws {500} Internal Server Error - Database query failure
 */
export const getDestinationByIdController = catchAsync(
  async (
    req: Request,
    res: Response<ApiResponse<GetDestinationResponseType>>
  ) => {
    const { id } = req.params;
    const { success, error } = getDestinationByIdSchema.safeParse({ id });

    if (!success) return sendZodError(res, error);

    const destination = await getDestinationById(id);

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Destination retrieved successfully",
      { destination }
    );
  }
);
