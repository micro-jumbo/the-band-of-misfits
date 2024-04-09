import { monorepo } from "@aws/pdk";
import { typescript } from "projen";
import { createTheMisfit, DepsProperties, projectDefaults } from "./common";

const jackName = "jack-in-the-cloud";

export function jackInTheCloud(
  root: monorepo.MonorepoTsProject,
  depVersions: DepsProperties,
) {
  const service = new typescript.TypeScriptProject({
    ...projectDefaults(root, jackName, "service"),
    deps: [
      `@aws-sdk/client-sfn`,
      "iso-datestring-validator",
      "fast-xml-parser",
    ],
    devDeps: ["aws-sdk-client-mock", "aws-sdk-client-mock-jest"],
  });

  return createTheMisfit(root, depVersions, jackName, service);
}
