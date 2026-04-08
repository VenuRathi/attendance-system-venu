import { Router, type IRouter } from "express";
import healthRouter from "./health";
import attendanceRouter from "./attendance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(attendanceRouter);

export default router;
