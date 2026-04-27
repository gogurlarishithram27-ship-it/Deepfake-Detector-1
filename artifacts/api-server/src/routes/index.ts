import { Router, type IRouter } from "express";
import healthRouter from "./health";
import detectRouter from "./detect";

const router: IRouter = Router();

router.use(healthRouter);
router.use(detectRouter);

export default router;
