import express from "express";
import authUser from "../../middlewares/authUser.js";
import { chatWithAI } from "../../controllers/user/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", authUser, chatWithAI);

export default aiRouter;
