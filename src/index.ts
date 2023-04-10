import semver from 'semver';
import type { Extension } from './types/extension';
import type { ExtensionMaker } from './types/extension-maker';
import type { ExporterConstructor } from './types/export-formats';
import type { DatasetMigrationFunction } from './types/migrations';
import { withDatasetContext } from './context';
import { matchesPath } from './object-specs';


/**
 * Provides a type for electron’s `process`
 * without having to add Electron as dependency.
 */
declare const process: NodeJS.Process & { type: 'browser' | 'renderer' }


/* The default export of Paneron extension’s extension.ts entry file
   should be the result of calling this function. */
export const makeExtension: ExtensionMaker = async (options) => {
  let plugin: Extension;

  const objectSpecs = options.objects ?? [];

  const getExporter: (exporterName: string) => Promise<ExporterConstructor> =
  async function getExporter(exporterName) {
    const exporter = options.exportFormats?.[exporterName];
    if (!exporter) {
      throw new Error(`No export format ${exporterName}`);
    }
    return (await exporter()).default;
  }

  if (process.type === 'browser') {
    // Initializes the Electron main thread part of the extension.
    // Can use Node environment. (Deprecated)
    const migration: DatasetMigrationFunction = options.datasetInitializer
      ? (await options.datasetInitializer()).default
      : async () => ({
          bufferChangeset: {},
          versionAfter: '1.0',
        });

    plugin = {

      isCompatible: (hostAppVersion: string) => (
        options.requiredHostAppVersion !== undefined &&
        semver.satisfies(hostAppVersion, options.requiredHostAppVersion)
      ),

      getObjectSpecs: () => {
        return objectSpecs;
      },

      getMigration: (datasetVersion) => (
        Object.entries(options.datasetMigrations || {}).
        filter(([migrationVersionSpec, _]) =>
          semver.satisfies(datasetVersion, migrationVersionSpec)
        ).
        map(([versionSpec, migration]) =>
          ({ versionSpec, migration })
        )[0]
      ),

      initialMigration: migration,
    };

  } else if (process.type === 'renderer') {
    // Initializes the renderer thread part of the extension
    // (the primary part that runs in browser)
    const mainViewImportResult = (options.mainView || (options as any).repoView)
      ? await (
          options.mainView ||
          /* Deprecated */(options as any).repoView
        )()
      : undefined;

    const objectSpecsWithCachedViews = (await Promise.all(objectSpecs.
      filter(spec => spec.views !== undefined).
      map(async (spec) => ({ ...spec, _viewCache: (await spec.views!()).default }))));

    plugin = {
      mainView: mainViewImportResult
        ? withDatasetContext(mainViewImportResult.default)
        : undefined,

      getObjectView: ({ objectPath, viewID }) => {
        const spec = Object.values(objectSpecsWithCachedViews).
          find(c => matchesPath(objectPath, c.matches));
        if (spec) {
          const view = spec._viewCache[viewID];
          return view;
        } else {
          console.error("Unable to find object view for object path", objectPath, viewID);
          throw new Error("Cannot find object view");
        }
      },

      getExporter,
    };

  } else {
    // Initializes extension for CLI. Runs in Node.
    // Primarily intended for e.g. exporting stuff in CI
    plugin = {
      getExporter,
    };
  }

  return plugin;
}
