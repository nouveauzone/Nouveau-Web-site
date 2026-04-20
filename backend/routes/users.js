const express = require("express");
const { param, query } = require("express-validator");
const User    = require("../models/User");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const router  = express.Router();

// GET /api/users — admin: all users
router.get(
  "/",
  protect,
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("search").optional().isString().isLength({ max: 100 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { page=1, limit=50, search } = req.query;
    const q = search ? { $or:[{ name:{$regex:search,$options:"i"} }, { email:{$regex:search,$options:"i"} }] } : {};
    const users = await User.find(q).select("-password").sort({ createdAt:-1 }).skip((page-1)*+limit).limit(+limit);
    const total = await User.countDocuments(q);
    res.json({ users, total });
  })
);

// DELETE /api/users/:id — admin
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid user id"), validate],
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message:"User deleted" });
  })
);

module.exports = router;
