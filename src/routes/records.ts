import { Router } from 'express';
import RecordController from '../controllers/RecordController';
import verifyJWT from '../middleware/auth';
import validateRequest from '../middleware/validation';
import { requireAnyPermission, requirePermission, requireRole } from '../middleware/authorization';
import { createRecordSchema, updateRecordSchema } from '../validation/recordSchemas';

const router = Router();

router.use(verifyJWT);

router.get('/admin/all', requireRole('admin'), RecordController.getAllRecords);
router.get('/', requirePermission('read_record'), RecordController.getUserRecords);
router.get('/summary', requirePermission('read_record'), RecordController.getUserRecordSummary);
router.post('/', requirePermission('create_record'), validateRequest(createRecordSchema), RecordController.createRecord);
router.get('/:id', requirePermission('read_record'), RecordController.getRecordById);
router.put(
  '/:id',
  requireAnyPermission(['update_record', 'update_own_record']),
  validateRequest(updateRecordSchema),
  RecordController.updateRecord,
);
router.delete(
  '/:id',
  requireAnyPermission(['delete_record', 'delete_own_record']),
  RecordController.deleteRecord,
);

export default router;
