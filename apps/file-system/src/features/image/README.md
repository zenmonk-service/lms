# Image Module

This is the main module that aggregates all image-related features.

## Features

- **Upload Image**: Handles uploading a single image to the server
- **Delete Image**: Handles deleting images from the server
- **Upload Multiple Images**: Handles uploading multiple images at once

## Architecture

The Image Module follows a feature-slice architecture where each feature is encapsulated in its own module:

```
src/features/image/
├── image.module.ts                   # Main module that imports all feature modules
├── upload-image/                     # Upload image feature
│   ├── upload-image.controller.ts
│   ├── upload-image.service.ts
│   └── upload-image.module.ts
├── delete-image/                     # Delete image feature
│   ├── delete-image.controller.ts
│   ├── delete-image.service.ts
│   └── delete-image.module.ts
└── upload-multiple-images/           # Upload multiple images feature
    ├── upload-multiple-images.controller.ts
    ├── upload-multiple-images.service.ts
    └── upload-multiple-images.module.ts
```

## Benefits of this Architecture

1. **Separation of Concerns**: Each feature is isolated and can be developed independently
2. **Maintainability**: Easier to understand and maintain smaller, focused modules
3. **Testability**: Features can be tested in isolation
4. **Scalability**: New features can be added without modifying existing code

## Usage

Import the `ImageModule` in your application's main module:

```typescript
import { Module } from '@nestjs/common';
import { ImageModule } from './features/image/image.module';

@Module({
  imports: [ImageModule],
})
export class AppModule {}
```
