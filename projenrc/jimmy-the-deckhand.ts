import { monorepo } from "@aws/pdk";
import { typescript } from "projen";
import { projectDefaults } from "./common";

const jimmyName = "jimmy-the-deckhand";

export function jimmyTheDeckhand(
  root: monorepo.MonorepoTsProject
  // @ts-ignore
) {
  return new typescript.TypeScriptProject({
    ...projectDefaults(root, jimmyName, "utils"),
    deps: [
      "@aws-lambda-powertools/metrics",
      "@aws-lambda-powertools/logger",
      "@aws-lambda-powertools/tracer",
      "@types/aws-lambda",
      "iso-datestring-validator"
    ]
  });
}
