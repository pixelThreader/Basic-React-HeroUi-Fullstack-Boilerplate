const http = require('http');

const post = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(data).length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (path) => {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${path}`, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
    });
};

async function test() {
    try {
        console.log('--- Testing Table Creation ---');
        const tableResult = await post('/api/tables', {
            name: 'users',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
                { name: 'username', type: 'TEXT' },
                { name: 'email', type: 'TEXT' }
            ]
        });
        console.log('Table Result:', tableResult);

        console.log('\n--- Testing List Tables ---');
        const tables = await get('/api/tables');
        console.log('Tables:', tables);

        console.log('\n--- Testing Data Creation ---');
        const dataResult = await post('/api/data/users', {
            username: 'johndoe',
            email: 'john@example.com'
        });
        console.log('Data Result:', dataResult);

        console.log('\n--- Testing Data Read ---');
        const data = await get('/api/data/users');
        console.log('Data:', data);

        console.log('\n--- Verification Successful! ---');
    } catch (error) {
        console.error('Verification Failed:', error);
    }
}

test();
