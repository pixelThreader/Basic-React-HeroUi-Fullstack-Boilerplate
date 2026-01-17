import { Router } from 'express';
import { globalSearch, getSuggestions } from '@/controllers/search-controller';

const router = Router();

router.get('/', globalSearch);
router.get('/suggest', getSuggestions);

export default router;
