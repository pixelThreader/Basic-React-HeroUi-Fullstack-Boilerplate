import { Request, Response } from 'express';
import { getDb } from '@/db/database';

export const getAllData = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    try {
        const db = await getDb();
        const data = await db.all(`SELECT * FROM ${tableName}`);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createData = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    const body = req.body;

    try {
        const db = await getDb();
        const columns = Object.keys(body).join(', ');
        const placeholders = Object.keys(body).map(() => '?').join(', ');
        const values = Object.values(body);

        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        const result = await db.run(sql, values);

        res.status(201).json({
            message: 'Data created successfully',
            id: result.lastID
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateData = async (req: Request, res: Response) => {
    const { tableName, id } = req.params;
    const body = req.body;

    try {
        const db = await getDb();
        const setClause = Object.keys(body).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(body), id];

        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        await db.run(sql, values);

        res.json({ message: 'Data updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteData = async (req: Request, res: Response) => {
    const { tableName, id } = req.params;

    try {
        const db = await getDb();
        await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: 'Data deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
