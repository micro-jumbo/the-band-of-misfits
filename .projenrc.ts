import { monorepo } from "@aws/pdk";
import { DependencyType, javascript, JsonPatch } from "projen";
import { DepsProperties } from "./projenrc/common";
import { jackInTheCloud } from "./projenrc/jack-in-the-cloud";

const depVersions: DepsProperties = {
  cdkVersion: "2.132.1",
  pdkVersion: "0.23.19",
};

const root = new monorepo.MonorepoTsProject({
  name: "the-band-of-misfits",
  projenrcTs: true,
  packageManager: javascript.NodePackageManager.PNPM,
  devDeps: [`@aws/pdk@${depVersions.pdkVersion}`, "change-case-all", "jest"],
  github: true,
  publishDryRun: true,
  pnpmVersion: "8",
  minNodeVersion: "20.0.0",
});
root.addTask("clean", {
  exec: "git clean -X -d -f",
});
root.github?.tryFindWorkflow("build")?.file?.patch(
  JsonPatch.add("/jobs/build/steps/3", {
    name: "setup java",
    uses: "actions/setup-java@v4",
    with: {
      distribution: "corretto",
      "java-version": "17",
    },
  }),
);

const theMisfits = [...jackInTheCloud(root, depVersions)];

[root, ...theMisfits].forEach((project) => {
  ["jest", "ts-jest", "@types/jest"].forEach((dep) => {
    project.deps.addDependency(dep, DependencyType.TEST);
  });
});

root.synth();
