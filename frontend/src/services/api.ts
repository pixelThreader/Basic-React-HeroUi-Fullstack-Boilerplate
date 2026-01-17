const API_BASE_URL = 'http://localhost:3001/api';

export interface Column {
    name: string;
    type: string;
    isSearchable?: boolean;
}

export interface TableInfo {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
    isSearchable: boolean;
}

export const apiService = {
    // Table Management
    async getTables(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/tables`);
        if (!response.ok) throw new Error('Failed to fetch tables');
        return response.json();
    },

    async createTable(name: string, columns: Column[]): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, columns }),
        });
        if (!response.ok) throw new Error('Failed to create table');
        return response.json();
    },

    async deleteTable(name: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/tables/${name}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete table');
        return response.json();
    },

    async getTableSchema(name: string): Promise<TableInfo[]> {
        const response = await fetch(`${API_BASE_URL}/tables/${name}`);
        if (!response.ok) throw new Error('Failed to fetch table schema');
        return response.json();
    },

    async updateTable(name: string, data: {
        newName?: string,
        addColumns?: Column[],
        dropColumns?: string[],
        renameColumns?: { oldName: string, newName: string }[]
    }): Promise<{ message: string; newName: string }> {
        const response = await fetch(`${API_BASE_URL}/tables/${name}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update table');
        return response.json();
    },

    async updateSearchMeta(tableName: string, columns: { column_name: string, is_searchable: boolean }[]): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/tables/${tableName}/search-meta`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ columns }),
        });
        if (!response.ok) throw new Error('Failed to update search metadata');
        return response.json();
    },

    // Data Management
    async getTableData(tableName: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/data/${tableName}`);
        if (!response.ok) throw new Error('Failed to fetch table data');
        return response.json();
    },

    async createData(tableName: string, data: any): Promise<{ message: string; id: number }> {
        const response = await fetch(`${API_BASE_URL}/data/${tableName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create data');
        return response.json();
    },

    async updateData(tableName: string, id: any, data: any): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/data/${tableName}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update data');
        return response.json();
    },

    async deleteData(tableName: string, id: any): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/data/${tableName}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete data');
        return response.json();
    },

    async search(query: string): Promise<SearchResults> {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search');
        return response.json();
    },

    async suggest(query: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/search/suggest?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        return response.json();
    }
};

export interface SearchResults {
    topMatches?: any[];
    tables?: any[];
    relevantData?: any[];
}
