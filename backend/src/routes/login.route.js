import {Router} from "express"
import { loginHandler } from "../controllers/login.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJwt,loginHandler);

export default router;