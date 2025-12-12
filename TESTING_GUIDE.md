# CI/CD Pipeline Testing Guide

This guide documents the complete setup and testing process for the Intro2CI CI/CD pipeline using GitHub Actions and Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Git Repository Setup](#step-1-git-repository-setup)
3. [Step 2: GitHub Secrets Configuration](#step-2-github-secrets-configuration)
4. [Step 3: Docker Hub Setup](#step-3-docker-hub-setup)
5. [Step 4: Render Hosting Setup](#step-4-render-hosting-setup)
6. [Step 5: Enable GitHub Actions (Forked Repos)](#step-5-enable-github-actions-forked-repos)
7. [Step 6: Testing the Pipeline](#step-6-testing-the-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account with repository access
- Docker Hub account
-  Render account
-  Git installed locally
-  Node.js 18+ installed locally

---

## Step 1: Git Repository Setup

### Initial Setup

```bash
cd /Users/levominhphuong/Documents/Intro2CI/Intro2CI

# Initialize git repository (if not already done)
git init

# Create dev branch
git checkout -b dev

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Complete CI/CD demo project"

# Create main branch
git checkout -b main

# Add remote repository
git remote add origin <your-github-repo-url>

# Push both branches
git push -u origin main
git push -u origin dev
```

### Verify Setup

```bash
# Check current branch
git branch

# Check remote URL
git remote -v

# Should see both dev and main branches
```

---

## Step 2: GitHub Secrets Configuration

### Navigate to Secrets Settings

1. Go to your GitHub repository in browser
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each secret below

### Required Secrets

#### 1. DOCKER_USERNAME
- **Name:** `DOCKER_USERNAME`
- **Value:** Your Docker Hub username (e.g., `johndoe`)

#### 2. DOCKER_PASSWORD
- **Name:** `DOCKER_PASSWORD`
- **Value:** Docker Hub password or access token (recommended)
  - To create access token:
    - Go to [Docker Hub](https://hub.docker.com)
    - Profile → Account Settings → Security
    - Click "New Access Token"
    - Description: `GitHub Actions CI/CD`
    - Copy and use the token

#### 3. RENDER_DEPLOY_HOOK_DEV
- **Name:** `RENDER_DEPLOY_HOOK_DEV`
- **Value:** `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`
- Get from Render dev service → Settings → Deploy Hook

#### 4. RENDER_DEPLOY_HOOK_STAGING
- **Name:** `RENDER_DEPLOY_HOOK_STAGING`
- **Value:** `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`
- Get from Render staging service → Settings → Deploy Hook

#### 5. RENDER_DEPLOY_HOOK_PROD
- **Name:** `RENDER_DEPLOY_HOOK_PROD`
- **Value:** `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`
- Get from Render production service → Settings → Deploy Hook

### Verify Secrets

After adding all secrets, you should see 5 secrets listed in the repository.

---

## Step 3: Docker Hub Setup

### Create Repository

1. Log in to [Docker Hub](https://hub.docker.com)
2. Click **"Repositories"** → **"Create Repository"**
3. Configure:
   - **Name:** `intro2ci` (must match workflow configuration)
   - **Visibility:** Public or Private
   - **Description:** `CI/CD Demo - Node.js REST API`
4. Click **"Create"**

### Generate Access Token (Recommended)

1. Go to **Account Settings** → **Security**
2. Click **"New Access Token"**
3. **Description:** `GitHub Actions CI/CD Pipeline`
4. **Permissions:** Read, Write, Delete
5. Click **"Generate"**
6. **Copy the token** and update GitHub Secret `DOCKER_PASSWORD`

### Verify Repository

- Repository URL: `https://hub.docker.com/r/<username>/intro2ci`
- This will store images with tags: `dev`, `staging`, `production`, `v1.0.0`, etc.

---

## Step 4: Render Hosting Setup

### Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up or log in (GitHub sign-in recommended)

### Service 1: Development Environment

1. **Create Service:**
   - Dashboard → **"New +"** → **"Web Service"**
   - Connect GitHub repository
   - Select your `Intro2CI` repository

2. **Configure:**
   - **Name:** `intro2ci-dev`
   - **Region:** Choose closest to you
   - **Branch:** `dev`
   - **Root Directory:** (leave blank)
   - **Environment:** `Docker`
   - **Instance Type:** Free

3. **Environment Variables:**
   - `NODE_ENV` = `development`
   - `STAGE` = `dev`
   - `PORT` = `3000`

4. **Create and Get Deploy Hook:**
   - Click "Create Web Service"
   - Go to Settings → Deploy Hook → Create Deploy Hook
   - Copy the URL and save it

### Service 2: Staging Environment

1. **Create Service:**
   - Dashboard → **"New +"** → **"Web Service"**
   - Connect same repository

2. **Configure:**
   - **Name:** `intro2ci-staging`
   - **Region:** Same as dev
   - **Branch:** `main`
   - **Environment:** `Docker`
   - **Instance Type:** Free

3. **Environment Variables:**
   - `NODE_ENV` = `staging`
   - `STAGE` = `staging`
   - `PORT` = `3000`

4. **Create and Get Deploy Hook:**
   - Create service and copy deploy hook URL

### Service 3: Production Environment

1. **Create Service:**
   - Dashboard → **"New +"** → **"Web Service"**
   - Connect same repository

2. **Configure:**
   - **Name:** `intro2ci-production`
   - **Region:** Same as others
   - **Branch:** `main`
   - **Environment:** `Docker`
   - **Instance Type:** Free (or paid for production)

3. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `STAGE` = `production`
   - `PORT` = `3000`

4. **Create and Get Deploy Hook:**
   - Create service and copy deploy hook URL

### Update GitHub Secrets

Go back to GitHub and update the three Render deploy hook secrets with the real URLs you just copied.

### Service URLs

After creation, your services will be available at:
- Dev: `https://intro2ci-dev.onrender.com`
- Staging: `https://intro2ci-staging.onrender.com`
- Production: `https://intro2ci-production.onrender.com`

---

## Step 5: Enable GitHub Actions (Forked Repos)

If you forked this repository, GitHub Actions are disabled by default.

### Enable via Actions Tab

1. Go to **Actions** tab in GitHub
2. Look for "Workflows aren't being run on this forked repository" message
3. Click **"I understand my workflows, go ahead and enable them"**

### Enable via Settings

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions":
   - Select ✅ **"Allow all actions and reusable workflows"**
3. Under "Workflow permissions":
   - Select ✅ **"Read and write permissions"**
   - Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **"Save"**

---

## Step 6: Testing the Pipeline

### Understanding the Trigger Logic

| **Environment** | **Trigger** | **Docker Tags** | **Deployment** |
|----------------|-------------|-----------------|----------------|
| **Feature** | Push to `feature/*` branch | None | No deployment (tests only) |
| **Development** | Push to `dev` branch | `intro2ci:dev` | Deploy to dev environment |
| **Staging** | Push to `main` branch | `intro2ci:staging` | Deploy to staging environment |
| **Production** | Push version tag `v*.*.*` | `intro2ci:v1.0.0`<br>`intro2ci:production` | Deploy to production environment |

---

### Test 1: Feature Branch (Tests Only)

**Purpose:** Validate that feature branches only run tests without deployment.

```bash
cd /Users/levominhphuong/Documents/Intro2CI/Intro2CI

# Create feature branch
git checkout -b feature/test-pipeline

# Make a small change
echo "// Test pipeline" >> src/app.js

# Commit and push
git add .
git commit -m "test: Trigger CI pipeline on feature branch"
git push origin feature/test-pipeline
```

**Expected Results:**
- ✅ GitHub Actions runs tests
- ❌ No Docker build
- ❌ No deployment

**Verify:**
- GitHub Actions tab shows workflow run
- Only "Run Tests" job executes

---

### Test 2: Development Environment

**Purpose:** Test full dev deployment pipeline.

```bash
# Switch to dev branch
git checkout dev

# Merge feature branch
git merge feature/test-pipeline

# Push to trigger deployment
git push origin dev
```

**Expected Results:**
- ✅ Tests run successfully
- ✅ Docker image built and pushed as `<username>/intro2ci:dev`
- ✅ Deployed to Render dev environment

**Verify:**
1. **GitHub Actions:** All jobs complete (test → build-and-push → deploy-dev)
2. **Docker Hub:** See `intro2ci:dev` tag at `hub.docker.com/r/<username>/intro2ci/tags`
3. **Render:** `intro2ci-dev` service shows new deployment
4. **API Test:**
   ```bash
   curl https://intro2ci-dev.onrender.com/status
   # Should return: "stage": "dev"
   ```

---

### Test 3: Staging Environment

**Purpose:** Test staging deployment.

```bash
# Switch to main branch
git checkout main

# Merge dev into main
git merge dev

# Push to trigger staging deployment
git push origin main
```

**Expected Results:**
- ✅ Tests run successfully
- ✅ Docker image built and pushed as `<username>/intro2ci:staging`
- ✅ Deployed to Render staging environment

**Verify:**
1. **GitHub Actions:** All jobs complete (test → build-and-push → deploy-staging)
2. **Docker Hub:** See `intro2ci:staging` tag
3. **Render:** `intro2ci-staging` service shows new deployment
4. **API Test:**
   ```bash
   curl https://intro2ci-staging.onrender.com/status
   # Should return: "stage": "staging"
   ```

---

### Test 4: Production Environment

**Purpose:** Test production deployment with version tagging.

```bash
# Make sure you're on main branch
git checkout main

# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0 - First production release"

# Push the tag
git push origin v1.0.0
```

**Expected Results:**
- Tests run successfully
- Docker image built with TWO tags:
  - `<username>/intro2ci:v1.0.0` (version-specific)
  - `<username>/intro2ci:production` (latest production)
- Deployed to Render production environment

**Verify:**
1. **GitHub Actions:** All jobs complete (test → build-and-push → deploy-production)
2. **Docker Hub:** See both `v1.0.0` AND `production` tags
3. **Render:** `intro2ci-production` service shows new deployment
4. **API Test:**
   ```bash
   curl https://intro2ci-production.onrender.com/status
   # Should return: "stage": "production"
   ```

---

### Test All Endpoints

After all deployments are complete, test all environments:

```bash
# Development
curl https://intro2ci-dev.onrender.com/health
curl https://intro2ci-dev.onrender.com/status
curl https://intro2ci-dev.onrender.com/

# Staging
curl https://intro2ci-staging.onrender.com/health
curl https://intro2ci-staging.onrender.com/status
curl https://intro2ci-staging.onrender.com/

# Production
curl https://intro2ci-production.onrender.com/health
curl https://intro2ci-production.onrender.com/status
curl https://intro2ci-production.onrender.com/
```

**Expected:** Each `/status` endpoint returns different `stage` values: `dev`, `staging`, or `production`.

---

## Typical Development Workflow

Here's the recommended workflow for making changes:

```bash
# 1. Create feature branch
git checkout dev
git pull origin dev
git checkout -b feature/add-new-feature

# 2. Make changes and test locally
npm install
npm test
npm start

# 3. Commit and push feature branch
git add .
git commit -m "feat: Add new feature"
git push origin feature/add-new-feature
# → GitHub Actions runs tests (no deployment)

# 4. Merge to dev for testing in dev environment
git checkout dev
git merge feature/add-new-feature
git push origin dev
# → Tests + Build + Deploy to DEV

# 5. Test in dev, then promote to staging
git checkout main
git pull origin main
git merge dev
git push origin main
# → Tests + Build + Deploy to STAGING

# 6. Test in staging, then release to production
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
# → Tests + Build + Deploy to PRODUCTION
```

---

## Semantic Versioning for Production Releases

Use semantic versioning (MAJOR.MINOR.PATCH) for production releases:

```bash
# Patch release (bug fixes): v1.0.0 → v1.0.1
git tag -a v1.0.1 -m "Release v1.0.1 - Bug fixes"
git push origin v1.0.1

# Minor release (new features, backward compatible): v1.0.1 → v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0 - New features"
git push origin v1.1.0

# Major release (breaking changes): v1.1.0 → v2.0.0
git tag -a v2.0.0 -m "Release v2.0.0 - Major update with breaking changes"
git push origin v2.0.0
```

---

## Monitoring Your Pipeline

### GitHub Actions

- **URL:** `https://github.com/<username>/Intro2CI/actions`
- **Features:**
  - View all workflow runs
  - Click any run to see detailed logs
  - See job status (pending, running, success, failed)
  - Download logs for debugging

### Docker Hub

- **URL:** `https://hub.docker.com/r/<username>/intro2ci/tags`
- **Check:**
  - All image tags (dev, staging, production, version tags)
  - Image size and last push time
  - Pull commands for each tag

### Render Dashboard

- **URL:** `https://dashboard.render.com/`
- **Monitor:**
  - Deployment status (building, live, failed)
  - Deployment logs
  - Service metrics (CPU, memory, requests)
  - Live URL and health status
  - Environment variables

---

## Troubleshooting

### Issue: GitHub Actions Not Running

**Cause:** Actions disabled on forked repositories

**Solution:**
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Enable "Read and write permissions"

---

### Issue: Docker Build Fails

**Common Causes:**
- Invalid Dockerfile syntax
- Missing dependencies in `package.json`
- Docker Hub credentials incorrect

**Solution:**
1. Check GitHub Actions logs for specific error
2. Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
3. Test Docker build locally:
   ```bash
   docker build -t intro2ci:test .
   docker run -p 3000:3000 intro2ci:test
   ```

---

### Issue: Deployment Not Triggered

**Common Causes:**
- Wrong branch/tag name
- Deploy hook URL incorrect
- Render service not configured properly

**Solution:**
1. Verify branch name matches workflow triggers
2. Check deploy hook URLs in GitHub Secrets
3. Verify Render service is active and not suspended
4. Check Render deployment logs for errors

---

### Issue: Tests Failing in CI

**Common Causes:**
- Node.js version mismatch
- Missing dependencies
- Environment-specific issues

**Solution:**
1. Check test logs in GitHub Actions
2. Run tests locally: `npm test`
3. Verify Node.js version in workflow matches local (18)
4. Check `package-lock.json` is committed

---

### Issue: Render Service Won't Start

**Common Causes:**
- Port mismatch (must use PORT env var)
- Missing environment variables
- Docker image not found

**Solution:**
1. Check Render logs in service dashboard
2. Verify environment variables are set correctly
3. Ensure Docker image was pushed successfully
4. Check health check endpoint is working

---

## Useful Commands

### Git Commands

```bash
# View all branches
git branch -a

# View all tags
git tag

# View remote tags
git ls-remote --tags origin

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0

# View git log with tags
git log --oneline --decorate
```

### Docker Commands

```bash
# Pull an image from Docker Hub
docker pull <username>/intro2ci:dev

# List local images
docker images

# Run container locally
docker run -p 3000:3000 -e NODE_ENV=development -e STAGE=dev <username>/intro2ci:dev

# View running containers
docker ps

# View container logs
docker logs <container-id>
```

### Testing Commands

```bash
# Run tests locally
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Start server locally
npm start
```

---

## Success Checklist

After completing all steps, you should have:

- Git repository with `dev` and `main` branches
- 5 GitHub Secrets configured
- Docker Hub repository created
- 3 Render web services running (dev, staging, production)
- GitHub Actions enabled and running workflows
- Successful test deployments to all environments
- All API endpoints responding correctly
- Docker images with correct tags in Docker Hub

---

## Resources

- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Docker Documentation:** https://docs.docker.com/
- **Render Documentation:** https://render.com/docs
- **Semantic Versioning:** https://semver.org/

---

## Contact & Support

For issues or questions about this project:
1. Check the troubleshooting section above
2. Review GitHub Actions logs for detailed errors
3. Check Render deployment logs
4. Open an issue in the GitHub repository

---

**Last Updated:** November 11, 2025
**Version:** 1.0.0

