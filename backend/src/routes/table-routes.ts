import { Router } from 'express';
import { listTables, createTable, deleteTable, getTableSchema, updateSearchMetadata, updateTable } from '@/controllers/table-controller';

const router = Router();

router.get('/', listTables);
router.post('/', createTable);
router.get('/:name', getTableSchema);
router.delete('/:name', deleteTable);
router.patch('/:name', updateTable);
router.put('/:name/search-meta', updateSearchMetadata);

export default router;
