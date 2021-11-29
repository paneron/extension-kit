import semver from 'semver';
import 'electron';
import log from 'electron-log';
import type { Extension } from './types/extension';
import type { ExtensionMaker } from './types/extension-maker';
import type { DatasetMigrationFunction } from './types/migrations';
import { withDatasetContext } from './context';
import { matchesPath } from './object-specs';


/* The default export of Paneron extension’s extension.ts entry file
   should be the result of calling this function. */
export const makeExtension: ExtensionMaker = async (options) => {
  let plugin: Extension;

  const objectSpecs = options.objects ?? [];

  if (process.type === 'browser') {
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
          log.error("Unable to find object view for object path", objectPath, viewID);
          throw new Error("Cannot find object view");
        }
      },
    };

  } else {
    log.error("Paneron extension: Unsupported process type", options.name);
    throw new Error("Unsupported process type");
  }

  return plugin;
}
