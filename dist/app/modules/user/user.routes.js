"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateZodSchema_1 = require("../../middlewares/validateZodSchema");
const user_controller_1 = require("./user.controller");
const user_interface_1 = require("./user.interface");
const user_validator_1 = require("./user.validator");
const router = (0, express_1.Router)();
router.post("/", (0, validateZodSchema_1.validateRequest)(user_validator_1.CreateUserZodSchema), user_controller_1.userController.createUser);
router.post("/verify-otp", (0, validateZodSchema_1.validateRequest)(user_validator_1.verifyOTPZodSchema), user_controller_1.userController.verifyOTP);
router.get("/", (0, checkAuth_1.checkAuth)([user_interface_1.IRole.ADMIN]), user_controller_1.userController.getAllUsers);
router.get("/me", (0, checkAuth_1.checkAuth)([...Object.values(user_interface_1.IRole)]), user_controller_1.userController.getMe);
router.get("/:userId", (0, checkAuth_1.checkAuth)([user_interface_1.IRole.ADMIN]), user_controller_1.userController.getSingleUser); // admin route
router.patch("/:userId", (0, validateZodSchema_1.validateRequest)(user_validator_1.updateUserZodSchema), user_controller_1.userController.updateUser);
exports.UserRoutes = router;
