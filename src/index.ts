import semver from 'semver';
import type { ExtensionMaker } from './types/extension-maker';
import type { MigrationInfo } from './types/migrations';
import { withDatasetContext } from './context';


/**
 * The default export of Paneron extension’s extension.ts entry file
 * should be the result of calling this function.
 */
export const makeExtension: ExtensionMaker = async (options) => {
  //const objectSpecs = options.objects ?? [];

  const exportFormats = options.exportFormats ?? {};

  const migration: MigrationInfo = options.datasetInitializer ?? {
    versionAfter: '1.0.0',
    migrator: async function* defaultDatasetInitializer() { yield {} },
  };

  const mainView = options.mainView;

  //const objectSpecsWithCachedViews = (await Promise.all(objectSpecs.
  //  filter(spec => spec.views !== undefined).
  //  map(async (spec) => ({ ...spec, _viewCache: (await spec.views!()).default }))));

  return {
    mainView: withDatasetContext(mainView),

    requiredHostAppVersionSpec: options.requiredHostAppVersion,

    getObjectView: ({ objectPath, viewID }) => {
      return undefined;
      // const spec = Object.values(objectSpecsWithCachedViews).
      //   find(c => matchesPath(objectPath, c.matches));
      // if (spec) {
      //   const view = spec._viewCache[viewID];
      //   return view;
      // } else {
      //   console.error("Unable to find object view for object path", objectPath, viewID);
      //   throw new Error("Cannot find object view");
      // }
    },

    exportFormats,

    isCompatible: (hostAppVersion: string) => (
      options.requiredHostAppVersion !== undefined &&
      semver.satisfies(hostAppVersion, options.requiredHostAppVersion)
    ),

    getObjectSpecs: () => {
      return []
      //return objectSpecs;
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
  } as const;
}


import { DatasetContext } from './context';
import HelpTooltip from './widgets/HelpTooltip';
import PropertyView, { Select, TextInput } from './widgets/Sidebar/PropertyView';
import makeSearchResultList from './widgets/SearchResultList';
import ErrorBoundary from './widgets/ErrorBoundary';
import { isObject } from './util';
import useDebounce from './useDebounce';

export {
  DatasetContext,
  HelpTooltip,
  ErrorBoundary,
  makeSearchResultList,
  isObject,
  useDebounce,

  PropertyView,
  Select,
  TextInput,
};
