import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketDataRouter from "./market-data";
import economicCalendarRouter from "./economic-calendar";
import aiAnalyzeRouter from "./ai-analyze";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketDataRouter);
router.use(economicCalendarRouter);
router.use(aiAnalyzeRouter);

export default router;
