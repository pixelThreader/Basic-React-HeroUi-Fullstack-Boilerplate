import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tableRoutes from '@/routes/table-routes';
import dataRoutes from '@/routes/data-routes';
import searchRoutes from '@/routes/search-routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tables', tableRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
