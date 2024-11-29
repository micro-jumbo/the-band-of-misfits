import { monorepo } from "@aws/pdk";
import { DependencyType, javascript } from "projen";
import { allProjects, DepsProperties } from "./projenrc/common";
import { jackInTheCloud } from "./projenrc/jack-in-the-cloud";
import { jimmyTheDeckhand } from "./projenrc/jimmy-the-deckhand";

const depVersions: DepsProperties = {
  sdkVersion: "3.679.0",
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
  workflowContainerImage: "timbru31/java-node:17-20",
  workflowBootstrapSteps: [
    {
      name: "Set ownership",
      run: "chown -R $(id -u):$(id -g) $PWD",
    },
  ],
  gitignore: [".idea"],
});
root.addTask("clean", {
  exec: "git clean -X -d -f",
});

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
