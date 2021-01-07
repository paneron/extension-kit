import path from 'path';
import semver from 'semver';
import 'electron';
import log from 'electron-log';
import { Extension } from './types/extension';
import { ExtensionMaker } from './types/extension-maker';
import { withDatasetContext } from './context';
import { SerializableObjectSpec, DEFAULT_SPECS, matchesPath } from './object-specs';
import { stripLeadingSlash } from './util';


/* The default export of Paneron extension’s extension.ts entry file
   should be the result of calling this function. */
export const makeExtension: ExtensionMaker = async (options) => {
  let plugin: Extension;

  const objectSpecs = options.objects || DEFAULT_SPECS;

  if (process.type === 'browser') {
    plugin = {

      isCompatible: (hostAppVersion: string) => (
        options.requiredHostAppVersion !== undefined &&
        semver.satisfies(hostAppVersion, options.requiredHostAppVersion)
      ),

      getObjectSpecs: () => {
        return objectSpecs;
      },

      objectsToBuffers: (objects) => {
        const buffers: Record<string, Uint8Array> = {};
        for (const [objectPath, obj] of Object.entries(objects)) {
          const spec = Object.values(objectSpecs).
            find(c => matchesPath(objectPath, c.matches));

          if (spec) {
            const objectBuffersRelative = (spec as SerializableObjectSpec).serialize(obj);

            const objectBuffers: Record<string, Uint8Array> =
              Object.entries(objectBuffersRelative).
              map(([objectRelativePath, data]) => ({
                [path.join(objectPath, objectRelativePath)]: data,
              })).
              reduce((p, c) => ({ ...p, ...c }), {});

            Object.assign(buffers, objectBuffers);
          } else {
            log.error("Unable to find object spec for object path", objectPath);
            throw new Error("Unable to find object spec for path");
          }
        }
        return buffers;
      },

      indexObjects: (rawData) => {
        // 1. Go through paths and organize them by matching object spec.
        // If a path matches some spec, that path is considered new object root,
        // and subsequent paths are considered to belong to this object
        // if they are descendants of object root path.
        const toProcess: {
          objectPath: string
          data: Record<string, Uint8Array>
          spec: SerializableObjectSpec
        }[] = [];

        // Sorted paths will appear in fashion [/, /foo/, /foo/bar.yaml, /baz/, /baz/qux.yaml, ...]
        const paths = Object.keys(rawData).sort();

        let currentSpec: SerializableObjectSpec | undefined;
        let currentObject: {
          path: string
          buffers: Record<string, Uint8Array>
        } | null = null;

        for (const p of paths) {

          if (currentObject && p.startsWith(currentObject.path)) {
            // We are in the middle of processing an object
            // and current path is a descendant of object’s path.

            // Accumulate current path into current object for deserialization later.
            const objectRelativePath = stripLeadingSlash(p.replace(currentObject.path, ''));
            currentObject.buffers[`/${objectRelativePath}`] = rawData[p];

            log.debug("Matched path to object", p, currentObject.path, objectRelativePath);

          } else {
            // Were we in the middle of processing a spec and an object?
            if (currentSpec && currentObject) {
              // If yes, add that spec and accumulated object to list for further processing...
              toProcess.push({
                objectPath: currentObject.path,
                data: { ...currentObject.buffers },
                spec: currentSpec,
              });
              // ...and reset/flush accumulated object.
              currentObject = null;
            }

            // Find a matching spec for current path.
            currentSpec = Object.values(objectSpecs).find(c => matchesPath(p, c.matches));

            if (currentSpec) {
              // If a matching spec was found, start a new object.
              currentObject = { path: p, buffers: {} };
              // Current path will be the root path for the object.
              currentObject.buffers['/'] = rawData[p];
            }
          }
        }

        // 2. Deserialize accumulated buffers into objects.
        const index: Record<string, Record<string, any>> = {};
        for (const { objectPath, data, spec } of toProcess) {
          index[objectPath] = spec.deserialize(data);
        }

        return index;
      },

      getMigration: (datasetVersion) => (
        Object.entries(options.datasetMigrations).
        filter(([migrationVersionSpec, _]) =>
          semver.satisfies(datasetVersion, migrationVersionSpec)
        ).
        map(([versionSpec, migration]) =>
          ({ versionSpec, migration })
        )[0]
      ),

      getInitialMigration: options.datasetInitializer,
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
