import { Router } from "express";

// user cotrollers
import {
  createUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserInfo,
  addUserSkills,
  updateUserSkills,
  verifyCode,
  getProfile,
} from "../controller/userController.js";

// admin controllers
import { getAllUser } from "../controller/adminController.js";

// authentication
import authentication from "../middleware/authentication.js";

// autherization
import { authrizeAlumni, authrizeAdmin } from "../middleware/authrizeRole.js";

const router = Router();

// creating user
router.route("/").post(createUser).get(authentication, getUserProfile);
// login and logout
router.route("/auth").post(loginUser);
router.post("/logout", logoutUser);
router.put("/updateSkills",authentication,updateUserSkills)
router.post("/addUserSkills",authentication,addUserSkills)

// verify-code
// router.route("/verify/:email")
router.post("/verify/:email", verifyCode);

router.get("/:rollNumber", getProfile);



export default router;
