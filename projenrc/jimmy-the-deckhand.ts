import { monorepo } from "@aws/pdk";
import { typescript } from "projen";
import { DepsProperties, projectDefaults } from "./common";

const jimmyName = "jimmy-the-deckhand";

export function jimmyTheDeckhand(
  root: monorepo.MonorepoTsProject,
  // @ts-ignore
  depVersions: DepsProperties,
) {
  return new typescript.TypeScriptProject({
    ...projectDefaults(root, jimmyName, "utils"),
    deps: [
      "iso-datestring-validator",
      "@aws-lambda-powertools/metrics",
      "@aws-lambda-powertools/logger",
      "@aws-lambda-powertools/tracer",
      "@types/aws-lambda",
    ],
  });
}
