import { Request, Response } from 'express';
import MiniSearch from 'minisearch';
import { getDb } from '@/db/database';

const getSearchDocuments = async () => {
    const db = await getDb();
    const tablesResponse = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tableNames = tablesResponse.map(t => t.name);

    const documents: any[] = [];
    let docId = 1;

    // 1. Index Table Names
    for (const name of tableNames) {
        documents.push({
            id: `table-${name}`,
            type: 'table',
            name: name,
            text: name,
            category: 'Tables'
        });
    }

    // 2. Index Table Data
    for (const tableName of tableNames) {
        const rows = await db.all(`SELECT * FROM "${tableName}"`);
        const meta = await db.all("SELECT column_name FROM _search_metadata WHERE table_name = ? AND is_searchable = 1", [tableName]);
        const searchableColumns = new Set(meta.map(m => m.column_name));

        for (const row of rows) {
            // Only include searchable columns in row content
            const rowContent = Object.entries(row)
                .filter(([key]) => searchableColumns.has(key))
                .map(([key, value]) => `${key}: ${value}`)
                .join(' ');

            if (rowContent.trim()) {
                documents.push({
                    id: `data-${tableName}-${row.id || docId++}`,
                    type: 'data',
                    tableName: tableName,
                    dataId: row.id,
                    text: rowContent,
                    raw: row,
                    category: 'Relevant data'
                });
            }
        }
    }
    return documents;
};

export const globalSearch = async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const documents = await getSearchDocuments();

        const miniSearch = new MiniSearch({
            fields: ['text', 'name'], // fields to index
            storeFields: ['type', 'name', 'tableName', 'dataId', 'raw', 'category'], // fields to return
            searchOptions: {
                boost: { name: 2 },
                fuzzy: 0.2,
                prefix: true
            }
        });

        miniSearch.addAll(documents);

        // Perform search
        const results = miniSearch.search(query);

        // Categorize results
        const categorized: any = {
            topMatches: [],
            tables: [],
            relevantData: []
        };

        // If query looks like an ID (numeric), try to find exact ID match first
        const numericQuery = parseInt(query);

        results.forEach((result: any, index: number) => {
            // Logic for "Top matches": 
            // - First result (highest score)
            // - Or if it's a data type and the query is an exact match for its dataId
            const isExactId = !isNaN(numericQuery) && result.dataId === numericQuery;

            if (index === 0 || isExactId) {
                categorized.topMatches.push(result);
            }

            if (result.type === 'table') {
                categorized.tables.push(result);
            } else if (result.type === 'data') {
                categorized.relevantData.push(result);
            }
        });

        // Remove duplicates from categories if they are in topMatches
        const topIds = new Set(categorized.topMatches.map((m: any) => m.id));
        categorized.tables = categorized.tables.filter((t: any) => !topIds.has(t.id));
        categorized.relevantData = categorized.relevantData.filter((d: any) => !topIds.has(d.id));

        // Remove empty categories
        if (categorized.topMatches.length === 0) delete categorized.topMatches;
        if (categorized.tables.length === 0) delete categorized.tables;
        if (categorized.relevantData.length === 0) delete categorized.relevantData;

        res.json(categorized);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestions = async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const documents = await getSearchDocuments();

        const miniSearch = new MiniSearch({
            fields: ['text', 'name'],
            storeFields: ['type', 'name', 'tableName', 'dataId', 'category'],
            searchOptions: {
                boost: { name: 2 },
                fuzzy: 0.2,
                prefix: true
            }
        });

        miniSearch.addAll(documents);

        const suggestions = miniSearch.autoSuggest(query);
        res.json(suggestions.slice(0, 5));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
