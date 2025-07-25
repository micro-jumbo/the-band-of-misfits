import path from "path";
import { infrastructure, monorepo, type_safe_api } from "@aws/pdk";
import { pascalCase } from "change-case-all";
import { awscdk, Project, typescript } from "projen";
import { TypeScriptModuleResolution } from "projen/lib/javascript/typescript-config";

export interface DepsProperties {
  sdkVersion: string;
  smithyVersion: string;
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
  name: string
): typescript.TypeScriptProjectOptions {
  return {
    defaultReleaseBranch: "main",
    entrypoint: "src/index",
    name: `@the-band-of-misfits/${group}-${name}`,
    outdir: `misfits/${group}/${name}`,
    packageManager: parent.package.packageManager,
    parent,
    projenrcTs: true
  };
}

function defaultSmithyBuildOptions(
  name: string,
  depsVersions: DepsProperties
): type_safe_api.SmithyBuildOptions {
  return {
    plugins: {
      "typescript-client-codegen": {
        package: `${name}`,
        packageVersion: "0.0.1",
        packageManager: "npm"
      }
    },
    maven: {
      dependencies: [
        `software.amazon.smithy:smithy-validation-model:${depsVersions.smithyVersion}`,
        `software.amazon.smithy:smithy-openapi:${depsVersions.smithyVersion}`,
        `software.amazon.smithy:smithy-aws-traits:${depsVersions.smithyVersion}`,
        "software.amazon.smithy.typescript:smithy-typescript-codegen:0.26.0",
        "software.amazon.smithy.typescript:smithy-aws-typescript-codegen:0.26.0",
        `software.amazon.smithy:smithy-model:${depsVersions.smithyVersion}`,
        `software.amazon.smithy:smithy-cli:${depsVersions.smithyVersion}`
      ]
    }
  };
}

// @ts-ignore
function createSmithyClientProject(
  monorepoProject: monorepo.MonorepoTsProject,
  apiProject: type_safe_api.TypeSafeApiProject,
  clientDefaults: typescript.TypeScriptProjectOptions,
  depsVersions: DepsProperties
): Project {
  const outdir = path.join("generated", "client", "typescript");

  const smithyClient = new typescript.TypeScriptProject({
    ...clientDefaults,
    parent: apiProject,
    outdir,
    entrypoint: "lib/index",
    sampleCode: false,
    eslint: false,
    deps: [
      "tslib@^2.6.2",
      "@aws-crypto/sha256-browser@5.2.0",
      "@aws-crypto/sha256-js@5.2.0",
      getDep(depsVersions, "SDK", "core"),
      getDep(depsVersions, "SDK", "credential-provider-node"),
      getDep(depsVersions, "SDK", "middleware-host-header"),
      getDep(depsVersions, "SDK", "middleware-logger"),
      getDep(depsVersions, "SDK", "middleware-recursion-detection"),
      getDep(depsVersions, "SDK", "middleware-user-agent"),
      getDep(depsVersions, "SDK", "region-config-resolver"),
      getDep(depsVersions, "SDK", "types"),
      getDep(depsVersions, "SDK", "util-user-agent-browser"),
      getDep(depsVersions, "SDK", "util-user-agent-node"),
      "@smithy/config-resolver",
      "@smithy/core@^3.1.1",
      "@smithy/experimental-identity-and-auth@^0.3.40",
      "@smithy/fetch-http-handler@^5.0.1",
      "@smithy/hash-node@^4.0.1",
      "@smithy/invalid-dependency@^4.0.1",
      "@smithy/middleware-content-length@^4.0.1",
      "@smithy/middleware-endpoint@^4.0.1",
      "@smithy/middleware-retry@^4.0.3",
      "@smithy/middleware-serde@^4.0.1",
      "@smithy/middleware-stack@^4.0.1",
      "@smithy/node-config-provider@^4.0.1",
      "@smithy/node-http-handler@^4.0.2",
      "@smithy/protocol-http@^5.0.1",
      "@smithy/smithy-client@^4.1.2",
      "@smithy/types@^4.3.1",
      "@smithy/url-parser@^4.0.1",
      "@smithy/util-base64@^4.0.0",
      "@smithy/util-body-length-browser@^4.0.0",
      "@smithy/util-body-length-node@^4.0.0",
      "@smithy/util-defaults-mode-browser@^4.0.3",
      "@smithy/util-defaults-mode-node@^4.0.3",
      "@smithy/util-middleware@^4.0.1",
      "@smithy/util-retry@^4.0.1",
      "@smithy/util-utf8@^4.0.0",
      "concurrently"
    ],
    tsconfig: {
      compilerOptions: {
        lib: ["dom", "es2019"],
        noUnusedParameters: false,
        noUnusedLocals: false,
        noImplicitReturns: false,
        moduleResolution: TypeScriptModuleResolution.NODE,
      },
    },
  });
  // smithyClient.setScript("build", "echo tsc");
  // Make sure smithy client builds after model
  monorepoProject.addImplicitDependency(
    smithyClient,
    apiProject.model.smithy!.name
  );
  monorepoProject.addWorkspacePackages(
    path.relative(monorepoProject.outdir, smithyClient.outdir)
  );
  smithyClient.preCompileTask.exec("rm -rf src/*");
  // const generatedDir = path.relative(
  //   smithyClient.outdir, pathToGeneratedClientProject(apiProject)
  // )
  const generatedDir = path.join(
    path.relative(smithyClient.outdir, apiProject.model.outdir),
    "build",
    "smithyprojections",
    apiProject.model.smithy!.name.replace("/", "-"),
    "source",
    "typescript-client-codegen"
  );
  smithyClient.preCompileTask.exec("mkdir -p src && touch src/.gitkeep");
  smithyClient.preCompileTask.exec(`cp -rf ${generatedDir}/src/* src/`);
  // smithyClient.preCompileTask.exec(`pnpm install @smithy/core`);
  smithyClient.gitignore.addPatterns("src");

  return smithyClient;
}

export interface Misfit {
  service: typescript.TypeScriptProject;
  infra: infrastructure.InfrastructureTsProject;
  // smithyClient: typescript.TypeScriptProject;
  example?: awscdk.AwsCdkTypeScriptApp;
}

export function allProjects(misfit: Misfit): typescript.TypeScriptProject[] {
  return [misfit.service, misfit.infra];
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
  }
): Misfit {
  const apiDefaults = projectDefaults(root, misfitName, "api");
  const clientDefaults = projectDefaults(root, misfitName, "api-client");
  const smithyBuildOptions: type_safe_api.SmithyBuildOptions =
    defaultSmithyBuildOptions(clientDefaults.name, dependencies.depVersions);
  const api = new type_safe_api.TypeSafeApiProject({
    ...apiDefaults,
    model: {
      language: type_safe_api.ModelLanguage.SMITHY,
      options: {
        smithy: {
          serviceName: {
            namespace: "eu.micro_jumbo.the_band_of_misfits",
            serviceName: pascalCase(misfitName)
          },
          smithyBuildOptions
        }
      }
    },
    // CDK infrastructure in TypeScript
    infrastructure: {
      language: type_safe_api.Language.TYPESCRIPT
    },
    // Lambda handlers in TypeScript
    handlers: {
      languages: [type_safe_api.Language.TYPESCRIPT],
      options: {
        typescript: {
          deps: [service.name, ...(dependencies?.handlers ?? [])]
        }
      }
    }
  });

  // @ts-ignore
  const smithyClient = createSmithyClientProject(
    root,
    api,
    clientDefaults,
    dependencies?.depVersions
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
        noUnusedLocals: false
      }
    }
  });
  return { service, infra, example };
}
