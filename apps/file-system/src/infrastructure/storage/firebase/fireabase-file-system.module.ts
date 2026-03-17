import { Module } from "@nestjs/common";
import { FirebaseFileSystemService } from "./firebase-file-system.service";

@Module({
    imports: [],
    providers: [FirebaseFileSystemService],
    exports: [FirebaseFileSystemService],
})
export class FirebaseFileSystemModule {}