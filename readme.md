# Pulumi TypeScript problem repro

This repo contains some code to repro an RESOURCE_EXHAUSTED problem in Pulumi when using TypeScript

## Environment

The project is tested on 2 very different environments, with the same issue.

### Environment 1

Running on Ubuntu in WSL 2 on Windows 11 Pro.

Azure CLI version info:
{
  "azure-cli": "2.28.0",
  "azure-cli-core": "2.28.0",
  "azure-cli-telemetry": "1.0.6",
  "extensions": {
    "account": "0.2.1",
    "application-insights": "0.1.14",
    "azure-devops": "0.21.0",
    "datafactory": "0.5.0"
  }
}

Node version info: v18.12.1

Pulumi version info: v3.48.0

### Environment 2

Running Windows 11 Pro.

Azure CLI version info:
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

Node version info: v18.12.1

Pulumi version info: v3.48.0

