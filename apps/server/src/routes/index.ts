import { Express, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requirePermission } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { authController } from '../controllers/auth.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { creditController } from '../controllers/credit.controller';
import { orderController } from '../controllers/order.controller';
import { documentController } from '../controllers/document.controller';
import { riskController } from '../controllers/risk.controller';
import { limitController } from '../controllers/limit.controller';

// File upload configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export function registerRoutes(app: Express) {
  // ========== Auth ==========
  const authRouter = Router();
  authRouter.post('/login', authLimiter, authController.login);
  authRouter.post('/register', authController.register);
  authRouter.post('/refresh', authController.refresh);
  authRouter.post('/logout', authenticate, authController.logout);
  authRouter.get('/me', authenticate, authController.me);
  app.use('/api/auth', authRouter);

  // ========== Dashboard ==========
  const dashRouter = Router();
  dashRouter.use(authenticate);
  dashRouter.get('/overview', dashboardController.getOverview);
  dashRouter.get('/trend', dashboardController.getTrend);
  dashRouter.get('/risk-overview', dashboardController.getRiskOverview);
  dashRouter.get('/recent-alerts', dashboardController.getRecentAlerts);
  dashRouter.get('/kpi/:metric', dashboardController.getKpiDetail);
  app.use('/api/dashboard', dashRouter);

  // ========== Credits ==========
  const creditRouter = Router();
  creditRouter.use(authenticate);
  creditRouter.get('/', requirePermission('credit:read'), creditController.list);
  creditRouter.post('/', requirePermission('credit:create'), creditController.create);
  creditRouter.get('/:id', requirePermission('credit:read'), creditController.getById);
  creditRouter.put('/:id/review', requirePermission('credit:review'), creditController.review);
  creditRouter.put('/:id/cancel', requirePermission('credit:update'), creditController.cancel);
  app.use('/api/credits', creditRouter);

  // ========== Orders ==========
  const orderRouter = Router();
  orderRouter.use(authenticate);
  orderRouter.get('/', requirePermission('order:read'), orderController.list);
  orderRouter.post('/', requirePermission('order:create'), orderController.create);
  orderRouter.get('/:id', requirePermission('order:read'), orderController.getById);
  orderRouter.put('/:id/status', requirePermission('order:update'), orderController.updateStatus);
  orderRouter.post('/:id/financing', requirePermission('order:create'), orderController.applyFinancing);
  app.use('/api/orders', orderRouter);

  // ========== Documents ==========
  const docRouter = Router();
  docRouter.use(authenticate);
  docRouter.get('/', requirePermission('document:read'), documentController.list);
  docRouter.post('/upload', requirePermission('document:create'), upload.single('file'), documentController.upload);
  docRouter.get('/:id', requirePermission('document:read'), documentController.getById);
  docRouter.get('/:id/image', requirePermission('document:read'), documentController.getImage);
  docRouter.post('/:id/extract', requirePermission('document:review'), documentController.extract);
  docRouter.post('/match', requirePermission('document:review'), documentController.match);
  app.use('/api/documents', docRouter);

  // ========== Risk ==========
  const riskRouter = Router();
  riskRouter.use(authenticate);
  riskRouter.get('/events', requirePermission('risk:read'), riskController.listEvents);
  riskRouter.get('/events/:id', requirePermission('risk:read'), riskController.getEvent);
  riskRouter.put('/events/:id/handle', requirePermission('risk:manage'), riskController.handleEvent);
  riskRouter.get('/rules', requirePermission('risk:read'), riskController.getRules);
  riskRouter.post('/scan/overdue', requirePermission('risk:manage'), riskController.triggerOverdueScan);
  riskRouter.post('/scan/return-rate', requirePermission('risk:manage'), riskController.triggerReturnRateScan);
  app.use('/api/risk', riskRouter);

  // ========== Limits ==========
  const limitRouter = Router();
  limitRouter.use(authenticate);
  limitRouter.get('/', requirePermission('limit:read'), limitController.list);
  limitRouter.get('/:enterpriseId', requirePermission('limit:read'), limitController.getByEnterprise);
  limitRouter.post('/:enterpriseId/calculate', requirePermission('limit:manage'), limitController.calculate);
  limitRouter.post('/:enterpriseId/adjust', requirePermission('limit:manage'), limitController.adjust);
  limitRouter.get('/:enterpriseId/history', requirePermission('limit:read'), limitController.getHistory);
  app.use('/api/limits', limitRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });
}
