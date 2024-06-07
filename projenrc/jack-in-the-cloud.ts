import { monorepo } from "@aws/pdk";
import { typescript } from "projen";
import {
  createTheMisfit,
  DepsProperties,
  getDep,
  Misfit,
  projectDefaults,
} from "./common";

const jackName = "jack-in-the-cloud";

export function jackInTheCloud(
  root: monorepo.MonorepoTsProject,
  depVersions: DepsProperties,
  jimmy: typescript.TypeScriptProject,
): Misfit {
  const service = new typescript.TypeScriptProject({
    ...projectDefaults(root, jackName, "service"),
    deps: [
      jimmy.name,
      getDep(depVersions, "SDK", "client-dynamodb"),
      getDep(depVersions, "SDK", "client-sfn"),
      getDep(depVersions, "SDK", "lib-dynamodb"),
      "fast-xml-parser",
    ],
    devDeps: ["aws-sdk-client-mock", "aws-sdk-client-mock-jest"],
  });

  return createTheMisfit(root, depVersions, jackName, service, {
    example: [jimmy.name],
    handlers: [jimmy.name, "@aws-lambda-powertools/metrics"],
    infra: [
      "aws-lambda",
      "@types/aws-lambda",
      getDep(depVersions, "SDK", "client-sfn"),
    ],
  });
}
