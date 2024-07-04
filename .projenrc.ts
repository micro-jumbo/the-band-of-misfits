import { monorepo } from "@aws/pdk";
import { DependencyType, javascript, JsonPatch } from "projen";
import { allProjects, DepsProperties } from "./projenrc/common";
import { jackInTheCloud } from "./projenrc/jack-in-the-cloud";
import { jimmyTheDeckhand } from "./projenrc/jimmy-the-deckhand";

const depVersions: DepsProperties = {
  sdkVersion: "3.609.0",
};

const root = new monorepo.MonorepoTsProject({
  name: "the-band-of-misfits",
  projenrcTs: true,
  packageManager: javascript.NodePackageManager.PNPM,
  devDeps: ["change-case-all", "jest", "@types/jest"],
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

const jimmy = jimmyTheDeckhand(root, depVersions);

const theMisfits = [jackInTheCloud(root, depVersions, jimmy)];

[...theMisfits].forEach((misfit) => {
  const all = allProjects(misfit);
  all.forEach((project) => {
    ["jest", "ts-jest", "@types/jest"].forEach((dep) => {
      project.deps.addDependency(dep, DependencyType.TEST);
    });
  });
});

root.synth();
