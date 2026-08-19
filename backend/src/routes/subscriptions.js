import { Router } from "express";
import {
  addSubscription,
  getDashboard,
  setSubscriptionStatus,
} from "../services/subscriptionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateCreatePayload,
  validateStatusPayload,
} from "../validators/subscriptionValidator.js";

export const subscriptionRouter = Router();

subscriptionRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const dashboard = await getDashboard();
    res.json(dashboard);
  })
);

subscriptionRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const fields = validateCreatePayload(req.body);
    const dashboard = await addSubscription(fields);
    res.status(201).json(dashboard);
  })
);

subscriptionRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const status = validateStatusPayload(req.body);
    const dashboard = await setSubscriptionStatus(req.params.id, status);
    res.json(dashboard);
  })
);
