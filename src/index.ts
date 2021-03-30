import semver from 'semver';
import 'electron';
import log from 'electron-log';
import { Extension } from './types/extension';
import { ExtensionMaker } from './types/extension-maker';
import { withDatasetContext } from './context';
import { matchesPath } from './object-specs';


/* The default export of Paneron extension’s extension.ts entry file
   should be the result of calling this function. */
export const makeExtension: ExtensionMaker = async (options) => {
  let plugin: Extension;

  const objectSpecs = options.objects ?? [];

  if (process.type === 'browser') {
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

      getInitialMigration: options.datasetInitializer || (async () => ({
        default: async () => ({
          bufferChangeset: {},
          versionAfter: '1.0',
        }),
      })),
    };

  } else if (process.type === 'renderer') {
    const mainViewImportResult = await (
      options.mainView ||
      /* Deprecated */(options as any).repoView
    )();

    const objectSpecsWithCachedViews = (await Promise.all(objectSpecs.
      filter(spec => spec.views !== undefined).
      map(async (spec) => ({ ...spec, _viewCache: (await spec.views!()).default }))));

    plugin = {
      mainView: withDatasetContext(mainViewImportResult.default),

      getObjectView: ({ objectPath, viewID }) => {
        const spec = Object.values(objectSpecsWithCachedViews).
          find(c => matchesPath(objectPath, c.matches));
        if (spec) {
          const view = spec._viewCache[viewID || 'default'];
          return withDatasetContext(view);
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
