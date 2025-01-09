# Project Name

Welcome to your new project! This README will guide you through the project structure, setup, and deployment process.

## 📁 Project Structure

Our recommended project layout:

| File/Folder | Purpose |
|-------------|---------|
| `app/`      | UI frontend content |
|  `app/package.json` | Project metadata and configuration for the UI |
| `mta.yaml` | Project metadata and configuration for the UI |
| `db/`       | Domain models and data |
| `srv/`      | Service models and code |
| `package.json` | Project metadata and configuration for the backend |
| `mta_cap/` | Project metadata and configuration for the backend |
| `.pipeline/` | Pipeline configuration for backend deployment |
| `README.md` | This getting started guide |

## 🚀 Getting Started

1. Open a new terminal
2. Run `cds watch`
   - In VS Code: _**Terminal** > Run Task > cds watch_
3. Start adding content, e.g., create a `db/schema.cds` file

## 🌐 Learn More

For more information, visit the [CAP documentation](https://cap.cloud.sap/docs/get-started/).

## 🚢 Deployment

### Using Pipeline

We use two separate `mta.yaml` files for deploying UI5 Apps and the backend:

1. **UI Deployment**: 
   - Location: Root directory `mta.yaml`
   - Method: Job Editor Configuration mode in the pipeline
   - Open the Subscriber Subaccount and maintain the destination for the backend service with name `FinanceApplications`.

2. **Backend Deployment**:
   - Location: `mta_cap/backend/mta.yaml`
   - Method: Source Repository mode
   - Uses `.pipeline/.config.yaml` for deployment

> **Note**: Ideally, `config.yaml` should not be committed to the repository. Place it in each environment branch and add it to `.gitignore` using `skip-worktree`.

### First-time Deployment to a New Environment

Maintain these environment variables:
- `AWS_LAMBDA_API_KEY`
- `AWS_LAMBDA_ENDPOINT`
- `AWS_LAMBDA_ENDPOINT_CLAIM`
- `AWS_LAMBDA_ENDPOINT_POLICY`
- `LANDSCAPE`

## 🛠 Development

To start development:

1. Run `bun run login-dev`
2. Run `bun run cap`

