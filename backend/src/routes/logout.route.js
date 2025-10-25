import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { logoutHandler } from "../controllers/logout.controller.js";

const router = Router();

router.route("/").get(verifyJwt, logoutHandler);

export default router;
