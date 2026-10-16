import { initializeTransactionalContext } from 'typeorm-transactional';
import { CommandFactory } from 'nest-commander';
import { AppModule } from '../../app.module';

async function bootstrap() {
  initializeTransactionalContext();
  console.log('publish-messages command started');
  await CommandFactory.run(AppModule);
}

void bootstrap().catch((error: unknown) => {
  console.error('CLI command failed:', error);
  process.exitCode = 1;
});