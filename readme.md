# Pulumi TypeScript problem repro

This repo contains some code to repro an RESOURCE_EXHAUSTED problem in Pulumi when using TypeScript

The code comes from a lab that we use for an IaC workshop, which has worked fine previously.

## Environments

The project is tested on 2 very different environments, with similar issues. On Windows, the result is a RESOURCE_EXHAUSTED error, and on Linux it is a "heap out of memory" exception.

Dev stack passphrase: Test123!

### Environment 1

Running on Ubuntu in WSL 2 on Windows 11 Pro.

Azure CLI version info:
```bash
azure-cli                         2.42.0
core                              2.42.0
telemetry                          1.0.8
Extensions:
account                            0.2.1
application-insights              0.1.14
azure-devops                      0.21.0
datafactory                        0.5.0
Dependencies:
msal                              1.20.0
azure-mgmt-resource             21.1.0b1
Python location '/opt/az/bin/python3'
Extensions directory '/home/zerokoll/.azure/cliextensions'
Python (Linux) 3.10.8 (main, Oct 28 2022, 04:19:18) [GCC 10.2.1 20210110]
```

Node version info: __v18.12.1__

Pulumi version info: __v3.48.0__

Output from `pulumi up` (after several minutes):

```bash
Previewing update (dev):
     Type                 Name           Plan       Info
 +   pulumi:pulumi:Stack  PulumiLab-dev  create     1 error; 15 messages


Diagnostics:
  pulumi:pulumi:Stack (PulumiLab-dev):
    error: an unhandled error occurred: Program exited with non-zero exit code: -1

    <--- Last few GCs --->
    [418:0x6660f50]   172799 ms: Mark-sweep (reduce) 8071.9 (8238.4) -> 8071.5 (8239.2) MB, 5486.1 / 0.0 ms  (+ 118.5 ms in 30 steps since start of marking, biggest step 5.4 ms, walltime since start of marking 5682 ms) (average mu = 0.321, current mu = 0.015)[418:0x6660f50]   178898 ms: Mark-sweep (reduce) 8072.6 (8239.2) -> 8072.3 (8240.2) MB, 6006.6 / 0.0 ms  (+ 35.2 ms in 15 steps since start of marking, biggest step 6.1 ms, walltime since start of marking 6089 ms) (average mu = 0.192, current mu = 0.009)
    <--- JS stacktrace --->
    FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
     1: 0xb6e500 node::Abort() [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     2: 0xa7e632  [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     3: 0xd47f20 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     4: 0xd482c7 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     5: 0xf25685  [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     6: 0xf37b6d v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     7: 0xf1226e v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     8: 0xf13637 v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
     9: 0xef480a v8::internal::Factory::NewFillerObject(int, v8::internal::AllocationAlignment, v8::internal::AllocationType, v8::internal::AllocationOrigin) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
    10: 0x12b7daf v8::internal::Runtime_AllocateInYoungGeneration(int, unsigned long*, v8::internal::Isolate*) [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
    11: 0x16e99f9  [/home/zerokoll/.nvm/versions/node/v18.12.1/bin/node]
```

### Environment 2

Running Windows 11 Pro.

Azure CLI version info:
```bash
azure-cli                         2.42.0
core                              2.42.0
telemetry                          1.0.8
Extensions:
account                            0.2.1
application-insights              0.1.14
azure-devops                      0.21.0
datafactory                        0.5.0
Dependencies:
msal                              1.20.0
azure-mgmt-resource             21.1.0b1
Python location 'C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\python.exe'
Extensions directory 'C:\Users\Chris\.azure\cliextensions'
Python (Windows) 3.10.8 (tags/v3.10.8:aaaf517, Oct 11 2022, 16:37:59) [MSC v.1933 32 bit (Intel)]
```

Node version info: __v18.12.1__

Pulumi version info: __v3.48.0__

Output from `pulumi up` after several minutes (after several minutes):

```bash
Previewing update (dev):
     Type                                                    Name              Plan       Info
 +   pulumi:pulumi:Stack                                     PulumiLab-dev     create     3 errors
 +   ├─ azure-native:resources:ResourceGroup                 PulumiLab         create
 +   │  ├─ azure-native:operationalinsights:Workspace        pulumilab-laws-   create
 +   │  ├─ azure-native:web:AppServicePlan                   pulumilab-plan-   create
 +   │  │  └─ azure-native:web:WebApp                        pulumilab-web-    create
 +   │  │     ├─ azure-native:insights/v20200202:Component   pulumilab-ai-     create
 +   │  │     └─ azure-native:web:WebAppApplicationSettings  AppSettings       create                                                                                                                                      
 +   │  ├─ azure-native:keyvault:Vault                       pulumilab-kv-     create
 +   │  │  └─ azure-native:keyvault:Secret                   testSecret        create
 +   │  └─ azure-native:sql:Server                           pulumilab-sql-    create
 +   └─ random:index:RandomPassword                          sqlAdminPassword  create                                                                                                                                      

Diagnostics:
  pulumi:pulumi:Stack (PulumiLab-dev):
    error: Error: failed to register new resource pulumilab-sql- [azure-native:sql:Server]: 8 RESOURCE_EXHAUSTED: Bandwidth exhausted
        at Object.registerResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\runtime\resource.ts:294:27)
        at new Resource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:402:13)
        at new CustomResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:786:9)
        at new Server (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\sql\server.ts:166:9)
        at Object.<anonymous> (C:\Code\Temp\iac_pulumi\index.ts:114:19)
        at Module._compile (node:internal/modules/cjs/loader:1159:14)
        at Module.m._compile (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:439:23)
        at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)
        at Object.require.extensions.<computed> [as .ts] (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:442:12)
        at Module.load (node:internal/modules/cjs/loader:1037:32)
    error: Error: failed to register new resource pulumilab-ai- [azure-native:insights/v20200202:Component]: 8 RESOURCE_EXHAUSTED: Bandwidth exhausted
        at Object.registerResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\runtime\resource.ts:294:27)
        at new Resource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:402:13)
        at new CustomResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:786:9)
        at new Component (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\insights\v20200202\component.ts:248:9)
        at Object.<anonymous> (C:\Code\Temp\iac_pulumi\index.ts:168:12)
        at Module._compile (node:internal/modules/cjs/loader:1159:14)
        at Module.m._compile (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:439:23)
        at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)
        at Object.require.extensions.<computed> [as .ts] (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:442:12)
        at Module.load (node:internal/modules/cjs/loader:1037:32)
    error: Error: failed to register new resource testSecret [azure-native:keyvault:Secret]: 8 RESOURCE_EXHAUSTED: Bandwidth exhausted
        at Object.registerResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\runtime\resource.ts:294:27)
        at new Resource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:402:13)
        at new CustomResource (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\resource.ts:786:9)
        at new Secret (C:\Code\Temp\iac_pulumi\node_modules\@pulumi\keyvault\secret.ts:100:9)
        at Object.<anonymous> (C:\Code\Temp\iac_pulumi\index.ts:85:1)
        at Module._compile (node:internal/modules/cjs/loader:1159:14)
        at Module.m._compile (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:439:23)
        at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)
        at Object.require.extensions.<computed> [as .ts] (C:\Code\Temp\iac_pulumi\node_modules\ts-node\src\index.ts:442:12)
        at Module.load (node:internal/modules/cjs/loader:1037:32)
```
