import { Extension } from './extension';
import { MigrationModule } from './migrations';
import { SerializableObjectSpec } from './object-spec';


export interface ExtensionMakerProps {
  name: string
  requiredHostAppVersion: string

  /* Principal dataset view. */
  mainView: () => Promise<{ default: React.FC<Record<never, never>> }>

  /* When reading or writing given object,
     the first object spec for which the `matches` rule matches it
     is used to deserialize/serialize runtime object structure from/to buffers.

     When reading dataset, raw byte data for matching path
     (including descendants, if it’s a directory)
     is passed to spec’s deserialize(). */
  objects?: SerializableObjectSpec[]

  /* Instructs which migration to run if new dataset is being initialized.
     The migration is supposed to return version matching latest extension version. */
  datasetInitializer?: () => MigrationModule

  /* Instructs a migration to run if current dataset version matches
     one of these specs (in semver format).
     The migration will return a new dataset version as a result.
     The returned version will be checked for migration matches again,
     the app will keep running matching migrations until one returns a version
     for which there is no matching migration versionSpec anymore.

     For example:

     Let’s say current extension version is 1.3.4,
     but user loaded dataset of version 1.1.8.

     If extension developer specified a migration with versionSpec "<1.2",
     the app will require the user to migrate.
     When migration is run, it’s given dataset path
     and currently specified version (1.1.8),
     based on which it rewrites dataset files as necessary
     and returns a new version (e.g., "1.2") after it finishes.

     If developer also specified a migration for ">=1.2 <1.3",
     it will be run automatically.

     Let’s say it returns "1.3" when finishes.
     1.3 doesn’t match any migration spec, so dataset version is updated to "1.3"
     and user can start the work.

     New extension versions continue to come out with no migrations necessary,
     but later the developer changes data schema again in 1.3.7. In that version,
     they include a migration with versionSpec ">=1.3 <1.3.7".
     When user opens their 1.3 dataset, they will be asked to update again,
     and that migration will run.

     The idea is that extension developer only has to support the most current
     data schema version, but they must alwyas provide migrations
     if data schema changes.

     IMPORTANT: It is developer’s responsibility
     to carefully specify migration version specs,
     as they could create infinite migration loops if they wanted to.
  */
  datasetMigrations?: {
    [versionSpec: string]: () => MigrationModule
  }
}


export type ExtensionMaker = (extensionOptions: ExtensionMakerProps) => Promise<Extension>;
