import * as pulumi from "@pulumi/pulumi";
import * as authorization from "@pulumi/azure-native/authorization";
import * as insights from '@pulumi/azure-native/insights/v20200202';
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import * as resources from "@pulumi/azure-native/resources";
import * as sql from "@pulumi/azure-native/sql";
import * as types from "@pulumi/azure-native/types";
import * as web from "@pulumi/azure-native/web";
import * as random from "@pulumi/random";

function getName(resourceType: string) {
    return `${pulumi.getProject().toLowerCase()}-${resourceType}-`
}

const config = new pulumi.Config();

const resourceGroup = new resources.ResourceGroup("PulumiLab", {
    resourceGroupName: "PulumiLab"
});

const appSvcPlan = new web.AppServicePlan(getName("plan"), {
    resourceGroupName: resourceGroup.name,
    kind: "linux",
    reserved: true,
    sku: {
        name: config.require("appServicePlanSize"),
        size: config.require("appServicePlanSize"),
        tier: config.require("appServicePlanTier")
    }
})

const isFreeTier = config.require("appServicePlanTier").toLowerCase() == "free";

const app = new web.WebApp(getName("web"), {
    resourceGroupName: resourceGroup.name,
    serverFarmId: appSvcPlan.id,
    siteConfig: {
        linuxFxVersion: "DOCKER|iacworkshop.azurecr.io/infrawebapp:v1",
        alwaysOn: !isFreeTier,
        use32BitWorkerProcess: isFreeTier
    },
    identity: {
        type: types.enums.web.ManagedServiceIdentityType.SystemAssigned
    }
});

const clientConfig = pulumi.output(authorization.getClientConfig());

const kv = new keyvault.Vault(getName("kv"), {
    resourceGroupName: resourceGroup.name,
    properties: {
        tenantId: clientConfig.tenantId,
        sku: {
            family: keyvault.SkuFamily.A,
            name: keyvault.SkuName.Standard
        },
        accessPolicies: [
            {
                objectId: clientConfig.objectId,
                tenantId: clientConfig.tenantId,
                permissions: {
                    secrets: [
                        "get",
                        "list",
                        "set",
                        "delete"
                    ]
                }
            },
            {
                objectId: app.identity.apply(x => x!.principalId),
                tenantId: app.identity.apply(x => x!.tenantId),
                permissions: {
                    secrets: [
                        "get",
                        "list"
                    ]
                }
            }
        ]
    }
})

new keyvault.Secret("testSecret", {
    resourceGroupName: resourceGroup.name,
    vaultName: kv.name,
    secretName: "testSecret",
    properties: {
        value: "secretValue",
    },
});

new web.WebAppApplicationSettings("AppSettings", {
    name: app.name,
    resourceGroupName: app.resourceGroup,
    properties: {
        "DOCKER_REGISTRY_SERVER_URL": "https://iacworkshop.azurecr.io",
        "DOCKER_REGISTRY_SERVER_USERNAME": "iacworkshop",
        "DOCKER_REGISTRY_SERVER_PASSWORD": "XXX",
        "KeyVaultName": kv.name
    }
});

const password = new random.RandomPassword("sqlAdminPassword", {
    length: 16,
    special: true
});

const sqlServer = new sql.Server(getName("sql"), {
    resourceGroupName: resourceGroup.name,
    administratorLogin: "infraadmin",
    administratorLoginPassword: password.result,
    administrators: {
        login: app.name,
        sid: app.identity.apply(x => x!.principalId)
    }
});

const db = new sql.Database(getName("db"), {
    databaseName: "infradb",
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    collation: "SQL_Latin1_General_CP1_CI_AS",
    sku: {
        name: "Basic"
    },
    maxSizeBytes: 1 * 1024 * 1024 * 1024
});

new sql.FirewallRule("AllowAllWindowsAzureIps", {
    firewallRuleName: "AllowAllWindowsAzureIps",
    serverName: sqlServer.name,
    resourceGroupName: resourceGroup.name,
    startIpAddress: "0.0.0.0",
    endIpAddress: "0.0.0.0",
});

new web.WebAppConnectionStrings("ConnectionStrings", {
    name: app.name,
    resourceGroupName: app.resourceGroup,
    properties: {
        "infradb": {
            type: types.enums.web.ConnectionStringType.SQLAzure,
            value: pulumi.interpolate `Data Source=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=infradb;Authentication=Active Directory Interactive;`
        }
    }
});

const laws = new operationalinsights.Workspace(getName("laws"), {
    resourceGroupName: resourceGroup.name,
});

const ai = new insights.Component(getName("ai"), {
    resourceGroupName: resourceGroup.name,
    workspaceResourceId: laws.id,
    applicationType: "web",
    kind: "web"
})
