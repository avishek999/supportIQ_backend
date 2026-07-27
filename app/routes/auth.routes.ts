import { Router } from "express";
import { registerUser, loginUser, logoutUser, getMe } from "../controller/auth.controler";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateUser, getMe);

export default router;
