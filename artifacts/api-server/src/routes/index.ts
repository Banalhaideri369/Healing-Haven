import { Router, type IRouter } from "express";
import healthRouter from "./health";
import checkoutRouter from "./checkout";
import notifyRouter from "./notify";
import coursesRouter from "./courses";
import bookingsRouter from "./bookingsRoute";
import settingsRouter from "./settings";
import bannersRouter from "./banners";

const router: IRouter = Router();

router.use(healthRouter);
router.use(checkoutRouter);
router.use(notifyRouter);
router.use(coursesRouter);
router.use(bookingsRouter);
router.use(settingsRouter);
router.use(bannersRouter);

export default router;
