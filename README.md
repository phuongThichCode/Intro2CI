# Intro2CI - CI/CD Demo Project

A simple REST API built with Node.js demonstrating CI/CD practices using Jenkins and GitHub Actions with Docker containerization and multi-stage deployment to Render.

## Project Overview

This project demonstrates a complete CI/CD pipeline with three deployment stages: Development, Staging, and Production. The API provides basic health check and status endpoints, perfect for learning CI/CD concepts.

## Architecture

### Branching Strategy

The project follows a structured branching and deployment workflow:

1. **Feature Development**: Developers create feature branches (`feature/*`) for new functionality
2. **Development Stage**: Feature branches merge into `dev` branch, triggering deployment to dev environment
3. **Staging Stage**: The `dev` branch merges into `main` branch, triggering deployment to staging environment
4. **Production Stage**: Release tags (`v*.*.*`) on `main` branch trigger deployment to production environment

### CI/CD Pipeline Flow

**Feature Branches (`feature/*`)**
- Trigger: Push to any `feature/*` branch
- Actions: Run tests and build Docker image
- Deployment: No deployment (validation only)

**Development Branch (`dev`)**
- Trigger: Push to `dev` branch
- Actions: Run tests, build Docker image, push to Docker Hub
- Deployment: Automatic deployment to Render dev environment

**Main Branch (`main`)**
- Trigger: Push to `main` branch
- Actions: Run tests, build Docker image, push to Docker Hub
- Deployment: Automatic deployment to Render staging environment

**Release Tags (`v*.*.*`)**
- Trigger: Creating a tag like `v1.0.0`
- Actions: Run tests, build Docker image, push to Docker Hub with version tag and `production` tag
- Deployment: Automatic deployment to Render production environment

## API Endpoints

The API provides three simple endpoints:

- `GET /` - Welcome message with available endpoints
- `GET /health` - Health check endpoint returning status and timestamp
- `GET /status` - Detailed status information including environment, stage, version, and uptime

## Prerequisites

- Node.js 18+ installed locally
- Docker installed (for containerization)
- GitHub account (for GitHub Actions)
- Jenkins server (for Jenkins pipeline)
- Docker Hub account
- Render account

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Intro2CI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Status endpoint
curl http://localhost:3000/status

# Root endpoint
curl http://localhost:3000/
```

## Docker Setup

### Build Docker Image

```bash
docker build -t intro2ci:local .
```

### Run Docker Container

```bash
docker run -p 3000:3000 -e NODE_ENV=development -e STAGE=dev intro2ci:local
```

### Test Containerized Application

```bash
curl http://localhost:3000/health
```

## Render Hosting Setup

Render will host three separate environments for this project. Follow these steps to set up each environment:

### 1. Create Render Account

Sign up at [render.com](https://render.com) if you haven't already.

### 2. Create Three Web Services

For each environment (dev, staging, production), create a new Web Service:

**Development Environment**
1. Go to Render Dashboard and click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `intro2ci-dev`
   - Environment: `Docker`
   - Branch: `dev`
   - Instance Type: Free
4. Add environment variables:
   - `NODE_ENV`: `development`
   - `STAGE`: `dev`
   - `PORT`: `3000`

**Staging Environment**
1. Create another Web Service
2. Configure the service:
   - Name: `intro2ci-staging`
   - Environment: `Docker`
   - Branch: `main`
   - Instance Type: Free
3. Add environment variables:
   - `NODE_ENV`: `staging`
   - `STAGE`: `staging`
   - `PORT`: `3000`

**Production Environment**
1. Create another Web Service
2. Configure the service:
   - Name: `intro2ci-production`
   - Environment: `Docker`
   - Branch: `main` (but only deploy on tags)
   - Instance Type: Free or paid depending on needs
3. Add environment variables:
   - `NODE_ENV`: `production`
   - `STAGE`: `production`
   - `PORT`: `3000`

### 3. Get Deploy Hooks

For each service, obtain the Deploy Hook URL:

1. Go to the service's Settings page
2. Scroll to "Deploy Hook" section
3. Copy the Deploy Hook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)
4. Save these URLs securely - you'll need them for CI/CD configuration

**Important**: Deploy Hooks act as authentication tokens. Keep them secret and never commit them to your repository.

### 4. Configure Auto-Deploy (Optional)

You can disable auto-deploy from Render's side if you want deployments to only happen via Deploy Hooks from CI/CD:

1. Go to service Settings
2. Under "Build & Deploy", set "Auto-Deploy" to "No"

## GitHub Actions Configuration

### 1. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token
- `RENDER_DEPLOY_HOOK_DEV`: Deploy hook URL for dev environment
- `RENDER_DEPLOY_HOOK_STAGING`: Deploy hook URL for staging environment
- `RENDER_DEPLOY_HOOK_PROD`: Deploy hook URL for production environment

### 2. Pipeline Triggers

The GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) automatically triggers on:

- Push to any `feature/*` branch
- Push to `dev` branch
- Push to `main` branch
- Push of tags matching `v*.*.*` pattern

### 3. Workflow Structure

The pipeline consists of several jobs:

1. **test**: Runs on all branches, executes Jest tests
2. **build-and-push**: Builds Docker image and pushes to Docker Hub (only for dev, main, and tags)
3. **deploy-dev**: Triggers Render deployment for dev environment
4. **deploy-staging**: Triggers Render deployment for staging environment
5. **deploy-production**: Triggers Render deployment for production environment

## Jenkins Configuration

### 1. Install Required Plugins

Ensure the following Jenkins plugins are installed:

- Docker Pipeline
- Git Plugin
- Credentials Binding Plugin
- Pipeline Plugin

### 2. Configure Jenkins Credentials

Add the following credentials in Jenkins (Manage Jenkins → Credentials):

**Docker Hub Credentials**
- Type: Username with password
- ID: `docker-hub-credentials`
- Username: Your Docker Hub username
- Password: Your Docker Hub password or access token

**Docker Hub Username**
- Type: Secret text
- ID: `docker-hub-username`
- Secret: Your Docker Hub username

**Render Deploy Hooks**
- Type: Secret text
- ID: `render-deploy-hook-dev`
- Secret: Dev environment deploy hook URL

- Type: Secret text
- ID: `render-deploy-hook-staging`
- Secret: Staging environment deploy hook URL

- Type: Secret text
- ID: `render-deploy-hook-prod`
- Secret: Production environment deploy hook URL

### 3. Create Jenkins Pipeline

1. Create a new Pipeline job in Jenkins
2. Under "Pipeline" section, select "Pipeline script from SCM"
3. Choose Git as SCM and provide your repository URL
4. Set Script Path to `Jenkinsfile`
5. Configure branch specifications:
   - For dev: `*/dev`
   - For staging: `*/main`
   - For production: Add tag filter `refs/tags/v*`

### 4. Configure Webhooks (Optional)

To trigger Jenkins builds automatically on push:

1. In your GitHub repository, go to Settings → Webhooks
2. Add webhook with Jenkins URL: `http://your-jenkins-url/github-webhook/`
3. Select "Just the push event"

## Docker Hub Setup

### 1. Create Docker Hub Repository

1. Log in to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Name it `intro2ci`
4. Set visibility (Public or Private)

### 2. Generate Access Token (Recommended)

Instead of using your password, create an access token:

1. Go to Account Settings → Security
2. Click "New Access Token"
3. Give it a description (e.g., "CI/CD Pipeline")
4. Copy the token and use it as `DOCKER_PASSWORD` in GitHub Secrets and Jenkins credentials

## Deployment Workflow Example

### Scenario: Implementing a New Feature

**Step 1: Create Feature Branch**
```bash
git checkout -b feature/add-version-endpoint
```

Make your changes and commit:
```bash
git add .
git commit -m "Add version endpoint"
git push origin feature/add-version-endpoint
```

Result: CI runs tests and builds image (no deployment)

**Step 2: Merge to Development**
```bash
git checkout dev
git merge feature/add-version-endpoint
git push origin dev
```

Result: CI runs tests, builds image, pushes to Docker Hub as `username/intro2ci:dev`, deploys to dev environment on Render

**Step 3: Merge to Staging**
```bash
git checkout main
git merge dev
git push origin main
```

Result: CI runs tests, builds image, pushes to Docker Hub as `username/intro2ci:staging`, deploys to staging environment on Render

**Step 4: Release to Production**
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Result: CI runs tests, builds image, pushes to Docker Hub as `username/intro2ci:v1.0.0` and `username/intro2ci:production`, deploys to production environment on Render

## Environment Variables

Each deployment stage uses different environment variables:

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| STAGE | dev | staging | production |
| PORT | 3000 | 3000 | 3000 |

These can be configured in Render's service settings under "Environment" section.

## Security Best Practices

This demo project focuses on CI/CD concepts, but in a real-world production environment, consider implementing:

### Secrets Management
- Never commit secrets to version control
- Use GitHub Secrets for GitHub Actions
- Use Jenkins Credentials Store for Jenkins
- Rotate secrets regularly
- Use different secrets for each environment

### API Security
- Implement authentication (JWT, API keys, OAuth)
- Add rate limiting to prevent abuse
- Use HTTPS/TLS for all communications
- Implement proper CORS policies
- Validate and sanitize all inputs
- Add request logging and monitoring

### Container Security
- Use official, minimal base images
- Scan images for vulnerabilities
- Don't run containers as root user
- Use multi-stage builds to minimize image size
- Keep dependencies updated

### Access Control
- Implement role-based access control (RBAC)
- Use principle of least privilege
- Separate production and non-production access
- Audit access logs regularly

### Network Security
- Use private networks for inter-service communication
- Implement API gateway for public-facing services
- Use WAF (Web Application Firewall) for production
- Enable DDoS protection

### Monitoring and Logging
- Implement centralized logging
- Set up alerts for anomalies
- Monitor application performance
- Track deployment success/failure rates
- Use error tracking services (Sentry, Rollbar)

## Troubleshooting

### Tests Failing in CI

Check the test output in the CI logs. Common issues:
- Missing dependencies: Ensure `package.json` is up to date
- Environment differences: Check Node.js version compatibility

### Docker Build Failures

- Verify Dockerfile syntax
- Check if all required files are present and not in `.dockerignore`
- Ensure base image is accessible

### Deployment Not Triggering

**GitHub Actions**:
- Verify branch/tag names match the trigger patterns
- Check GitHub Secrets are correctly set
- Review workflow file syntax

**Jenkins**:
- Verify credentials are configured correctly
- Check branch specifications in job configuration
- Review Jenkins logs for error messages

### Render Deployment Issues

- Verify Deploy Hook URLs are correct
- Check environment variables in Render service settings
- Review Render deployment logs
- Ensure Docker image was successfully pushed to Docker Hub

## Project Structure

```
Intro2CI/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
├── src/
│   ├── app.js                 # Express application
│   └── server.js              # Server entry point
├── tests/
│   └── app.test.js            # Jest test suite
├── .dockerignore              # Docker ignore patterns
├── .gitignore                 # Git ignore patterns
├── Dockerfile                 # Docker configuration
├── Jenkinsfile                # Jenkins pipeline
├── jest.config.js             # Jest configuration
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## Technologies Used

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Testing**: Jest, Supertest
- **Containerization**: Docker
- **CI/CD**: GitHub Actions, Jenkins
- **Hosting**: Render
- **Registry**: Docker Hub

## Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Ensure tests pass locally
4. Commit with clear messages
5. Push and create a pull request to `dev` branch

## License

MIT License - feel free to use this project for learning purposes.

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Jest Documentation](https://jestjs.io/)

## Contact

For questions or issues, please open an issue in the GitHub repository.


