import semver from "semver";
import { CORE_VERSION } from "./core-version";

export function isCoreVersionCompatible(range: string): boolean {
  if (!semver.validRange(range)) {
    return false;
  }

  return semver.satisfies(CORE_VERSION, range, { includePrerelease: true });
}
