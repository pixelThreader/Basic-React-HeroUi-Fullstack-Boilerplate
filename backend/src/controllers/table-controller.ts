import { Request, Response } from 'express';
import { getDb } from '@/db/database';

const initMetadata = async () => {
    const db = await getDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS _search_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT,
            column_name TEXT,
            is_searchable INTEGER DEFAULT 1,
            UNIQUE(table_name, column_name)
        )
    `);
};

export const listTables = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        res.json(tables.map(t => t.name));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTable = async (req: Request, res: Response) => {
    const { name, columns } = req.body;

    if (!name || !columns || !Array.isArray(columns)) {
        return res.status(400).json({ error: 'Invalid request. "name" and "columns" are required.' });
    }

    try {
        const db = await getDb();
        const columnsSql = columns.map((col: any) => `${col.name} ${col.type}`).join(', ');
        const sql = `CREATE TABLE IF NOT EXISTS "${name}" (${columnsSql})`;

        await db.exec(sql);

        // Store search metadata
        await initMetadata();
        for (const col of columns) {
            await db.run(
                "INSERT OR REPLACE INTO _search_metadata (table_name, column_name, is_searchable) VALUES (?, ?, ?)",
                [name, col.name, col.isSearchable === false ? 0 : 1]
            );
        }

        res.status(201).json({ message: `Table "${name}" created successfully.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTable = async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
        const db = await getDb();
        await db.exec(`DROP TABLE IF EXISTS "${name}"`);

        // Clean up metadata
        await initMetadata();
        await db.run("DELETE FROM _search_metadata WHERE table_name = ?", [name]);

        res.json({ message: `Table "${name}" deleted successfully.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTableSchema = async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
        const db = await getDb();
        const info = await db.all(`PRAGMA table_info("${name}")`);
        if (info.length === 0) {
            return res.status(404).json({ error: `Table "${name}" not found.` });
        }

        // Merge with search metadata
        await initMetadata();
        const meta = await db.all("SELECT column_name, is_searchable FROM _search_metadata WHERE table_name = ?", [name]);
        const metaMap = new Map(meta.map(m => [m.column_name, m.is_searchable]));

        const enrichedSchema = info.map(col => ({
            ...col,
            isSearchable: metaMap.has(col.name) ? metaMap.get(col.name) === 1 : true
        }));

        res.json(enrichedSchema);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSearchMetadata = async (req: Request, res: Response) => {
    const { name } = req.params;
    const { columns } = req.body; // Array of { column_name: string, is_searchable: boolean }

    try {
        const db = await getDb();
        await initMetadata();

        for (const col of columns) {
            await db.run(
                "INSERT OR REPLACE INTO _search_metadata (table_name, column_name, is_searchable) VALUES (?, ?, ?)",
                [name, col.column_name, col.is_searchable ? 1 : 0]
            );
        }

        res.json({ message: "Search metadata updated successfully." });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTable = async (req: Request, res: Response) => {
    const { name: oldName } = req.params;
    const { newName, addColumns, dropColumns, renameColumns } = req.body;

    try {
        const db = await getDb();
        await initMetadata();

        // 1. Rename Table
        let currentTableName = oldName;
        if (newName && newName !== oldName) {
            await db.exec(`ALTER TABLE "${oldName}" RENAME TO "${newName}"`);
            await db.run("UPDATE _search_metadata SET table_name = ? WHERE table_name = ?", [newName, oldName]);
            currentTableName = newName;
        }

        // 2. Rename Columns
        if (renameColumns && Array.isArray(renameColumns)) {
            for (const col of renameColumns) {
                await db.exec(`ALTER TABLE "${currentTableName}" RENAME COLUMN "${col.oldName}" TO "${col.newName}"`);
                await db.run("UPDATE _search_metadata SET column_name = ? WHERE table_name = ? AND column_name = ?", [col.newName, currentTableName, col.oldName]);
            }
        }

        // 3. Drop Columns
        if (dropColumns && Array.isArray(dropColumns)) {
            for (const colName of dropColumns) {
                try {
                    await db.exec(`ALTER TABLE "${currentTableName}" DROP COLUMN "${colName}"`);
                    await db.run("DELETE FROM _search_metadata WHERE table_name = ? AND column_name = ?", [currentTableName, colName]);
                } catch (e: any) {
                    console.error(`Failed to drop column ${colName}:`, e.message);
                }
            }
        }

        // 4. Add Columns
        if (addColumns && Array.isArray(addColumns)) {
            for (const col of addColumns) {
                await db.exec(`ALTER TABLE "${currentTableName}" ADD COLUMN ${col.name} ${col.type}`);
                await db.run(
                    "INSERT OR REPLACE INTO _search_metadata (table_name, column_name, is_searchable) VALUES (?, ?, ?)",
                    [currentTableName, col.name, col.isSearchable === false ? 0 : 1]
                );
            }
        }

        res.json({ message: `Table "${currentTableName}" updated successfully.`, newName: currentTableName });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
