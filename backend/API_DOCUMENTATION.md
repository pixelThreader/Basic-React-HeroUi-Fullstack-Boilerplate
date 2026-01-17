# API Documentation

Base URL: `http://localhost:3001`

All requests and responses use `application/json` format.

---

## 1. Table Management APIs

These APIs allow you to manage the database schema dynamically.

### List All Tables
- **Endpoint**: `GET /api/tables`
- **Description**: Returns an array of table names created by the user.
- **Response**:
  ```json
  ["users", "products", "orders"]
  ```

### Create a New Table
- **Endpoint**: `POST /api/tables`
- **Description**: Creates a new SQLite table with specified columns.
- **Body**:
  ```json
  {
    "name": "users",
    "columns": [
      { "name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT" },
      { "name": "username", "type": "TEXT NOT NULL" },
      { "name": "email", "type": "TEXT" },
      { "name": "created_at", "type": "DATETIME DEFAULT CURRENT_TIMESTAMP" }
    ]
  }
  ```
- **Response**:
  ```json
  { "message": "Table \"users\" created successfully." }
  ```

### Get Table Schema
- **Endpoint**: `GET /api/tables/:name`
- **Description**: Returns the structure of the specified table (uses SQLite PRAGMA table_info).
- **Response**:
  ```json
  [
    { "cid": 0, "name": "id", "type": "INTEGER", "notnull": 0, "dflt_value": null, "pk": 1 },
    { "cid": 1, "name": "username", "type": "TEXT", "notnull": 1, "dflt_value": null, "pk": 0 },
    ...
  ]
  ```

### Delete Table
- **Endpoint**: `DELETE /api/tables/:name`
- **Description**: Drops the specified table.
- **Response**:
  ```json
  { "message": "Table \"users\" deleted successfully." }
  ```

---

## 2. Table Data CRUD APIs

These APIs allow you to interact with the data stored in the tables.

### Get All Data
- **Endpoint**: `GET /api/data/:tableName`
- **Description**: Returns all records from the specified table.
- **Response**:
  ```json
  [
    { "id": 1, "username": "johndoe", "email": "john@example.com" },
    { "id": 2, "username": "janedoe", "email": "jane@example.com" }
  ]
  ```

### Create Data
- **Endpoint**: `POST /api/data/:tableName`
- **Description**: Inserts a new record into the specified table.
- **Body**: A JSON object mapping column names to values.
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Data created successfully",
    "id": 1
  }
  ```

### Update Data
- **Endpoint**: `PUT /api/data/:tableName/:id`
- **Description**: Updates a record by its `id`.
- **Body**: A JSON object containing the fields to update.
  ```json
  {
    "email": "newemail@example.com"
  }
  ```
- **Response**:
  ```json
  { "message": "Data updated successfully" }
  ```

### Delete Data
- **Endpoint**: `DELETE /api/data/:tableName/:id`
- **Description**: Deletes a record by its `id`.
- **Response**:
  ```json
  { "message": "Data deleted successfully" }
  ```

---

## 3. Health Check
- **Endpoint**: `GET /health`
- **Response**: `{ "status": "ok" }`
