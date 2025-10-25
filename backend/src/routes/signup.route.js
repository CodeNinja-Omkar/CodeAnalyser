import { Router } from "express";
import { signUpHandler } from "../controllers/signup.controller.js";

const router = Router();

router.route("/").post(signUpHandler);

export default router;