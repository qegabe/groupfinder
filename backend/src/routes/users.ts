import express from "express";
import User from "../models/user";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await User.getList();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.getByUsername(req.params.username);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

export default router;
