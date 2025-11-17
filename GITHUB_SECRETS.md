# GitHub Secrets Configuration

## Required Secrets

Add these **5 secrets** to your GitHub repository for the deployment workflow to work.

### How to Add Secrets:

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret below

---

## Secrets to Add:

### 1. AZURE_CLIENT_ID
- **Value**: Your App Registration Application (client) ID
- **Where to find**: Azure Portal → App registrations → Your app → Overview → Application (client) ID

### 2. AZURE_TENANT_ID
- **Value**: Your Directory (tenant) ID
- **Where to find**: Azure Portal → App registrations → Your app → Overview → Directory (tenant) ID

### 3. AZURE_SUBSCRIPTION_ID
- **Value**: Your Azure Subscription ID
- **Where to find**: Azure Portal → Subscriptions → Copy Subscription ID

### 4. ACR_LOGIN_SERVER
- **Value**: `beatthekingsacr.azurecr.io`
- **Where to find**: Azure Portal → Container registries → beatthekingsacr → Overview → Login server

### 5. AZURE_RESOURCE_GROUP
- **Value**: `beat-the-kings-rg`
- Your resource group name

---

## Summary Table:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `AZURE_CLIENT_ID` | Your client ID | App Registration → Overview |
| `AZURE_TENANT_ID` | Your tenant ID | App Registration → Overview |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | Azure Portal → Subscriptions |
| `ACR_LOGIN_SERVER` | `beatthekingsacr.azurecr.io` | Container Registry → Overview |
| `AZURE_RESOURCE_GROUP` | `beat-the-kings-rg` | Your resource group name |

---

## Important Notes:

✅ **Using Federated Credentials (OIDC)** - No client secrets needed!
✅ **Environment**: Make sure you have `development` environment in GitHub
✅ **Permissions**: Your App Registration must have:
   - Contributor role on `beat-the-kings-rg` resource group
   - AcrPush role on `beatthekingsacr` container registry

---

## Test Deployment:

Once all secrets are added:

```bash
git add .
git commit -m "test: trigger deployment"
git push origin main
```

Watch the deployment in: **Repository → Actions tab**
