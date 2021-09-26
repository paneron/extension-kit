export function getPathFromTabURI(uri: string): string | undefined {
  if (uri.indexOf(':') >= 1) {
    return uri.split(':')[1];
  } else {
    throw new Error("getPathFromTabURI: Invalid URI (doesn’t contain a colon)");
  }
}
