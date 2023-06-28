import express from "express";
import {
  userpost,
  userget,
  singleuserget,
  useredit,
  userdelete,
  userstatus,
  userExport,
} from "../controllers/usersController.js";
import upload from "../config/storageConfig.js";

const router = express.Router();

router.post("/user/register", upload.single("user_profile"), userpost);
router.get("/user/details", userget);
router.get("/user/:id", singleuserget);
router.put("/user/edit/:id", upload.single("user_profile"), useredit);
router.delete("/user/delete/:id", userdelete);
router.put("/user/status/:id", userstatus);
router.get("/userexport", userExport);

export default router;
