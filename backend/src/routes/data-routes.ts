import { Router } from 'express';
import * as dataController from '@/controllers/data-controller';

const router = Router();

router.get('/:tableName', dataController.getAllData);
router.post('/:tableName', dataController.createData);
router.put('/:tableName/:id', dataController.updateData);
router.delete('/:tableName/:id', dataController.deleteData);

export default router;
