# File Upload Service

Deployed [Link](https://file-system-ouzn.onrender.com)

A NestJS-based service for uploading and managing files with support for both local filesystem and Firebase Cloud Storage.

## Overview

This service provides REST APIs for:
- Uploading single images
- Uploading multiple images simultaneously
- Deleting images by URL

## Storage System

The service implements a flexible storage strategy that can be configured via environment variables:

### Local File System Storage

When `STORAGE_TYPE=local`:
- Files are stored in the local directory specified by `LOCAL_STORAGE_PATH`
- Unique filenames are generated using timestamps and random numbers
- Original file extensions are preserved
- Directory structure is automatically created if it doesn't exist
- Public URLs are generated using the `NEXT_PUBLIC_URL` environment variable
- Static file serving is configured to make uploaded files accessible via HTTP

### Firebase Cloud Storage

When `STORAGE_TYPE=gcs`:
- Files are uploaded to Firebase Cloud Storage bucket
- Files are made publicly accessible
- Metadata includes content type information
- Public URLs are generated using Firebase's storage URL format
- Firebase credentials are loaded from the path specified in `GCS_CREDENTIALS_PATH`

## Environment Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_PORT` | Port for the application to listen on | `3000` | No |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` | No |
| `STORAGE_TYPE` | Storage backend to use (`local` or `gcs`) | `local` | Yes |
| `NEXT_PUBLIC_URL` | Base URL for generating public file URLs | `http://localhost:8000` | Only for local storage |
| `LOCAL_STORAGE_PATH` | Path to local storage directory | `./uploads` | Only for local storage |
| `STORAGE_BUCKET` | Firebase storage bucket name | - | Only for Firebase storage |
| `GCS_CREDENTIALS_PATH` | Path to Firebase credentials JSON file | - | Only for Firebase storage |
| `PUBLIC_URL` | Firebase public URL prefix | - | Only for Firebase storage |
| `API_KEY` | Firebase API key | - | Only for Firebase storage |
| `AUTH_DOMAIN` | Firebase auth domain | - | Only for Firebase storage |
| `PROJECT_ID` | Firebase project ID | - | Only for Firebase storage |
| `MESSAGING_SENDER_ID` | Firebase messaging sender ID | - | Only for Firebase storage |
| `APP_ID` | Firebase app ID | - | Only for Firebase storage |

## Project Structure

The project follows a feature-slice architecture where each feature is encapsulated in its own module:

```
src/
├── features/
│   └── image/
│       ├── image.module.ts                   # Main image module
│       ├── upload-image/                     # Single image upload feature
│       │   ├── upload-image.controller.ts
│       │   ├── upload-image.service.ts
│       │   └── upload-image.module.ts
│       ├── delete-image/                     # Image deletion feature
│       │   ├── delete-image.controller.ts
│       │   ├── delete-image.service.ts
│       │   └── delete-image.module.ts
│       └── upload-multiple-images/           # Multiple image upload feature
│           ├── upload-multiple-images.controller.ts
│           ├── upload-multiple-images.service.ts
│           └── upload-multiple-images.module.ts
├── infrastructure/
│   └── storage/
│       ├── storage.module.ts                 # Storage module configuration
│       ├── storage-service.interface.ts      # Storage service interface
│       ├── local-file-system/                # Local storage implementation
│       │   └── local-file-system.service.ts
│       └── firebase/                         # Firebase storage implementation
│           ├── firebase.service.ts
│           ├── firebase-file-system.service.ts
│           └── firebase-config.ts
├── app.module.ts                             # Main application module
├── app.controller.ts                         # Main application controller
├── app.service.ts                            # Main application service
└── main.ts                                   # Application entry point
```

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Modify values according to your needs
4. Start the application:
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## Usage Examples

### Upload a Single Image

```bash
curl -X POST http://localhost:8000/image/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg"
```

### Upload Multiple Images

```bash
curl -X POST http://localhost:8000/images/multi \
  -H "Content-Type: multipart/form-data" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

### Delete an Image

```bash
curl -X DELETE http://localhost:8000/image/delete \
  -H "Content-Type: application/json" \
  -d '{"publicUrl": "http://localhost:8000/uploads/1744885643579-5631.jpg"}'
```

## Implementation Details

### File Naming Strategy

Files are renamed during upload to ensure uniqueness:
- Timestamp prefix (milliseconds since epoch)
- Random number suffix
- Original file extension preserved

Example: `1744885643579-5631.jpg`

### Error Handling

The service implements comprehensive error handling:
- Input validation (file existence, format)
- Storage service errors
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error logging

### Concurrency

Multiple files are uploaded concurrently using Promise.all() for better performance.

## Security Considerations

- No authentication is implemented - add authentication middleware for production use
- File size limits should be configured in production
- File type validation should be enhanced for production use
- Firebase security rules should be properly configured when using Firebase storage

## Testing

Run tests with:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT licensed.
