import path from "path";
import { infrastructure, monorepo, type_safe_api } from "@aws/pdk";
import { pascalCase } from "change-case-all";
import { awscdk, typescript } from "projen";

export interface DepsProperties {
  sdkVersion: string;
}

export function getDep(versions: DepsProperties, type: "SDK", subtype: string) {
  switch (type) {
    case "SDK":
      return `@aws-sdk/${subtype}@${versions.sdkVersion}`;
  }
}

export function projectDefaults(
  parent: monorepo.MonorepoTsProject,
  group: string,
  name: string,
): typescript.TypeScriptProjectOptions {
  return {
    defaultReleaseBranch: "main",
    entrypoint: "src/index",
    name: `@the-band-of-misfits/${group}-${name}`,
    outdir: `misfits/${group}/${name}`,
    packageManager: parent.package.packageManager,
    parent,
    projenrcTs: true,
  };
}

function defaultSmithyBuildOptions(
  name: string,
): type_safe_api.SmithyBuildOptions {
  return {
    projections: {
      openapi: {
        plugins: {
          openapi: {
            version: "3.0.2",
          },
        },
      },
      "ts-client": {
        plugins: {
          "typescript-codegen": {
            package: `${name}`,
            packageVersion: "0.0.1",
            packageManager: "npm",
          },
        },
      },
    },
    maven: {
      dependencies: [
        "software.amazon.smithy:smithy-validation-model:1.43.0",
        "software.amazon.smithy:smithy-openapi:1.43.0",
        "software.amazon.smithy:smithy-aws-traits:1.43.0",
        "software.amazon.smithy.typescript:smithy-typescript-codegen:0.19.0",
        "software.amazon.smithy.typescript:smithy-aws-typescript-codegen:0.19.0",
        "software.amazon.smithy:smithy-model:1.43.0",
        "software.amazon.smithy:smithy-cli:1.43.0",
      ],
    },
  };
}

function createSmithyClientProject(
  monorepoProject: monorepo.MonorepoTsProject,
  apiProject: type_safe_api.TypeSafeApiProject,
  clientDefaults: typescript.TypeScriptProjectOptions,
  depsVersions: DepsProperties,
): typescript.TypeScriptProject {
  const outdir = path.join("generated", "client", "typescript");

  const smithyClient = new typescript.TypeScriptProject({
    ...clientDefaults,
    parent: apiProject,
    outdir,
    entrypoint: "lib/index",
    sampleCode: false,
    eslint: false,
    deps: [
      "@aws-crypto/sha256-browser",
      "@aws-crypto/sha256-js",
      getDep(depsVersions, "SDK", "client-sts"),
      getDep(depsVersions, "SDK", "core"),
      getDep(depsVersions, "SDK", "credential-provider-node"),
      getDep(depsVersions, "SDK", "middleware-host-header"),
      getDep(depsVersions, "SDK", "middleware-logger"),
      getDep(depsVersions, "SDK", "middleware-recursion-detection"),
      getDep(depsVersions, "SDK", "middleware-signing"),
      getDep(depsVersions, "SDK", "middleware-user-agent"),
      getDep(depsVersions, "SDK", "region-config-resolver"),
      getDep(depsVersions, "SDK", "types"),
      getDep(depsVersions, "SDK", "util-user-agent-browser"),
      getDep(depsVersions, "SDK", "util-user-agent-node"),
      getDep(depsVersions, "SDK", "util-user-agent-browser"),
      getDep(depsVersions, "SDK", "util-user-agent-node"),
      "@smithy/config-resolver",
      "@smithy/fetch-http-handler",
      "@smithy/hash-node",
      "@smithy/invalid-dependency",
      "@smithy/middleware-content-length",
      "@smithy/middleware-retry",
      "@smithy/middleware-serde",
      "@smithy/middleware-stack",
      "@smithy/node-config-provider",
      "@smithy/node-http-handler",
      "@smithy/protocol-http",
      "@smithy/smithy-client",
      "@smithy/types",
      "@smithy/url-parser",
      "@smithy/util-base64",
      "@smithy/util-body-length-browser",
      "@smithy/util-body-length-node",
      "@smithy/util-defaults-mode-browser",
      "@smithy/util-defaults-mode-node",
      "@smithy/util-retry",
      "@smithy/util-utf8",
    ],
    tsconfig: {
      compilerOptions: {
        lib: ["dom", "es2019"],
        noUnusedParameters: false,
        noUnusedLocals: false,
        noImplicitReturns: false,
      },
    },
  });
  // Make sure smithy client builds after model
  monorepoProject.addImplicitDependency(
    smithyClient,
    apiProject.model.smithy!.name,
  );
  monorepoProject.addWorkspacePackages(
    path.relative(monorepoProject.outdir, smithyClient.outdir),
  );
  smithyClient.preCompileTask.exec("rm -rf src/*");
  const generatedDir = path.join(
    path.relative(smithyClient.outdir, apiProject.model.outdir),
    "build",
    "smithyprojections",
    apiProject.model.smithy!.name.replace("/", "-"),
    "ts-client",
    "typescript-codegen",
  );
  smithyClient.preCompileTask.exec("mkdir -p src && touch src/.gitkeep");
  smithyClient.preCompileTask.exec(`cp -r ${generatedDir}/src/* src/`);
  smithyClient.preCompileTask.exec(`pdk install @smithy/types`);
  smithyClient.gitignore.addPatterns("src");

  return smithyClient;
}

export interface Misfit {
  service: typescript.TypeScriptProject;
  infra: infrastructure.InfrastructureTsProject;
  smithyClient: typescript.TypeScriptProject;
  example: awscdk.AwsCdkTypeScriptApp;
}

export function allProjects(misfit: Misfit): typescript.TypeScriptProject[] {
  return [misfit.service, misfit.infra, misfit.smithyClient, misfit.example];
}

export function createTheMisfit(
  root: monorepo.MonorepoTsProject,
  misfitName: string,
  service: typescript.TypeScriptProject,
  dependencies: {
    depVersions: DepsProperties;
    example?: string[];
    handlers?: string[];
    infra?: string[];
  },
): Misfit {
  const apiDefaults = projectDefaults(root, misfitName, "api");
  const clientDefaults = projectDefaults(root, misfitName, "api-client");
  const smithyBuildOptions: type_safe_api.SmithyBuildOptions =
    defaultSmithyBuildOptions(clientDefaults.name);
  const api = new type_safe_api.TypeSafeApiProject({
    ...apiDefaults,
    model: {
      language: type_safe_api.ModelLanguage.SMITHY,
      options: {
        smithy: {
          serviceName: {
            namespace: "eu.micro_jumbo.the_band_of_misfits",
            serviceName: pascalCase(misfitName),
          },
          smithyBuildOptions,
        },
      },
    },
    // CDK infrastructure in TypeScript
    infrastructure: {
      language: type_safe_api.Language.TYPESCRIPT,
    },
    // Lambda handlers in TypeScript
    handlers: {
      languages: [type_safe_api.Language.TYPESCRIPT],
      options: {
        typescript: {
          deps: [service.name, ...(dependencies?.handlers ?? [])],
        },
      },
    },
  });

  const smithyClient = createSmithyClientProject(
    root,
    api,
    clientDefaults,
    dependencies?.depVersions,
  );
  const infra = new infrastructure.InfrastructureTsProject({
    ...projectDefaults(root, misfitName, "infra"),
    deps: [service.name, ...(dependencies?.infra ?? [])],
    stackName: misfitName,
    typeSafeApis: [api],
  });

  const example = new awscdk.AwsCdkTypeScriptApp({
    ...projectDefaults(root, misfitName, "examples"),
    cdkVersion: "2.1.0",
    deps: [infra.name, smithyClient.name, ...(dependencies?.example ?? [])],
    tsconfig: {
      compilerOptions: {
        skipLibCheck: true,
        noUnusedLocals: false,
      },
    },
  });

  return { service, infra, smithyClient, example };
}
