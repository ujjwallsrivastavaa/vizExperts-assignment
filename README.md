# Chunked Upload System

A system for uploading large ZIP files (>1GB) with resumability and fault tolerance. Built with Node.js/Express backend and React frontend.

## Features

- Large file support (>1GB) without memory issues
- Chunked upload with 5MB chunks
- Resume capability after interruption
- Automatic retry on failure
- Streaming I/O for memory efficiency
- Duplicate chunk handling
- Out-of-order chunk support
- ZIP file validation
- Automatic cleanup of abandoned uploads

## User Interface

- Real-time progress bar
- Visual chunk status grid
- Upload speed and ETA display
- Automatic resume on network failure

## Tech Stack

- Frontend: React.js
- Backend: Node.js + Express
- Database: MySQL 8.0
- File Storage: Local filesystem
- Hashing: SHA-256
- ZIP Parsing: yauzl
- Containerization: Docker

## Architecture

### Upload Flow

1. Frontend: Select ZIP file
2. Frontend: Calculate SHA-256 hash
3. Frontend → Backend: POST /upload/init
   - Backend creates upload record in DB
   - Backend pre-allocates file on disk
   - Backend returns uploadId + already-uploaded chunks
4. Frontend: Slice file into 5MB chunks
5. Frontend: Skip already-uploaded chunks (for resumability)
6. Frontend → Backend: POST /upload/chunk (max 3 concurrent)
   - Backend streams chunk to correct file offset
   - Backend marks chunk as SUCCESS in DB
7. Backend: When all chunks received:
   - Calculate final SHA-256
   - Validate ZIP structure
   - Mark as COMPLETED
8. Frontend: Display success + uploadId

## Quick Start

### Prerequisites

- Docker & Docker Compose (or Node.js 18+ and MySQL 8.0)

### Using Docker

```bash
cd Assignment-Project
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Local Development

Backend:
```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### POST /upload/init
Initialize new upload session.

Request:
```json
{
  "filename": "large_file.zip",
  "totalSize": 1073741824,
  "totalChunks": 205
}
```

Response:
```json
{
  "uploadId": "550e8400-e29b-41d4-a716-446655440000",
  "uploadedChunks": [0, 1, 5],
  "message": "Upload initialized successfully"
}
```

### POST /upload/chunk
Upload individual chunk (multipart/form-data).

Parameters:
- uploadId: string
- chunkIndex: number
- chunk: binary file data

### GET /upload/:id/status
Get upload status and progress.

### GET /upload/:id/contents
List ZIP file contents without extraction.

## Database Schema

```sql
CREATE TABLE uploads (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_size BIGINT UNSIGNED NOT NULL,
    total_chunks INT UNSIGNED NOT NULL,
    status ENUM('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'),
    file_path VARCHAR(512) NOT NULL,
    final_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

CREATE TABLE chunks (
    upload_id VARCHAR(36) NOT NULL,
    chunk_index INT UNSIGNED NOT NULL,
    status ENUM('PENDING', 'SUCCESS') DEFAULT 'PENDING',
    received_at TIMESTAMP NULL,
    PRIMARY KEY (upload_id, chunk_index),
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
);
```

## License

MIT
