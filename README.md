# LeetVibe Platform

Welcome to the LeetVibe platform! This project aims to provide a LeetCode-like experience with a minimal UI, an integrated coding environment, code execution and testing capabilities on a remote server, and a copilot-like feature powered by Azure OpenAI.

## Project Structure

The project is divided into two main parts:

-   `leetvibe-frontend/`: The React-based frontend application.
-   `leetvibe-backend/`: The Flask-based backend API.

## Features

-   **Modern UI**: Built with React and Tailwind CSS for a clean and responsive user experience.
-   **Integrated IDE**: Powered by Monaco Editor, providing a rich coding experience directly in the browser.
-   **Question System**: Displays coding questions for users to solve.
-   **AI Copilot**: Integrates with Azure OpenAI to provide intelligent coding assistance.
-   **Code Execution & Testing**: Allows users to run their code and test it against predefined test cases on a remote server.

## Setup and Local Development

### Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (LTS version recommended)
-   pnpm (Package Manager for Node.js)
-   Python 3.9+
-   pip (Python Package Installer)
-   Docker and Docker Compose (for backend deployment)

### Frontend Setup

1.  **Navigate to the frontend directory**:

    ```bash
    cd leetvibe-frontend
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Start the development server**:

    ```bash
    pnpm run dev
    ```

    The frontend application will be accessible at `http://localhost:5173`.

### Backend Setup

1.  **Navigate to the backend directory**:

    ```bash
    cd leetvibe-backend
    ```

2.  **Create a Python virtual environment**:

    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment**:

    ```bash
    source venv/bin/activate
    ```

4.  **Install Python dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the Flask application**:

    ```bash
    export FLASK_APP=src/main.py
    export FLASK_ENV=development
    flask run
    ```

    The backend API will be accessible at `http://localhost:5000`.

## Azure OpenAI Configuration (AI Copilot)

The AI Copilot feature integrates with Azure OpenAI. To enable it, ensure your `leetvibe-backend/src/routes/leetvibe.py` file has the correct Azure OpenAI endpoint, API key, API version, and deployment name. These are currently configured as:

```python
AZURE_OPENAI_ENDPOINT = "https://myopenairesourceforaia.openai.azure.com/"
AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY")
```

**Important**: For security, it is highly recommended to set `AZURE_OPENAI_API_KEY` as an environment variable in your deployment environment rather than hardcoding it.

```python
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
AZURE_DEPLOYMENT_NAME = "gpt-4o"
```

**Note**: If you encounter `401 Access Denied` errors, please verify your Azure OpenAI subscription key and ensure the API endpoint and deployment name are correct and active.

## Backend Deployment

The LeetVibe backend has been successfully deployed to the remote server at `45.129.182.243`. This section provides comprehensive details about the deployment process, configuration, and how to manage the backend service.

### Deployment Architecture

The backend deployment follows a straightforward architecture where the Flask application runs directly on the remote server using Python's built-in development server. While this approach is suitable for development and testing purposes, it provides a foundation that can be easily scaled to production-grade deployments using WSGI servers like Gunicorn or uWSGI in the future.

The deployment consists of several key components:

1.  **Flask Application**: The core backend service that handles API requests, manages questions, executes code, and integrates with Azure OpenAI for AI assistance.
2.  **Environment Configuration**: Proper setup of environment variables, particularly the Azure OpenAI API key, to ensure secure operation.
3.  **Process Management**: The backend runs as a background process using `nohup` to ensure it continues running even after SSH sessions are terminated.
4.  **Logging**: All application output is redirected to a log file for monitoring and debugging purposes.

### Deployment Details

**Server Information:**
- **Host**: 45.129.182.243
- **User**: root
- **Deployment Directory**: `/root/leetvibe-backend`
- **Port**: 5000
- **Access URL**: `http://45.129.182.243:5000`

**Deployment Process:**

The deployment process involved several critical steps to ensure the backend service runs reliably on the remote server. First, the entire `leetvibe-backend` directory was transferred to the remote server using SCP (Secure Copy Protocol). This included all source code, configuration files, and dependency specifications.

Once the files were transferred, the deployment script was created directly on the remote server to handle the installation and startup process. The script performs the following operations:

1.  **Environment Setup**: Sets the `AZURE_OPENAI_API_KEY` environment variable with the actual API key value.
2.  **Dependency Installation**: Installs all required Python packages using pip, including Flask, Flask-CORS, OpenAI SDK, and other dependencies specified in `requirements.txt`.
3.  **Service Startup**: Launches the Flask application in the background using `nohup` to ensure it continues running independently of the SSH session.
4.  **Logging Configuration**: Redirects all output to `backend.log` for monitoring and debugging purposes.

**Current Status:**

The backend service has been successfully deployed and is running on the remote server. The deployment includes proper error handling and logging to facilitate monitoring and troubleshooting. All necessary dependencies have been installed, including the OpenAI SDK which was initially missing from the requirements file.

### Security Considerations

The deployment implements several security measures, though additional hardening would be recommended for production environments:

**API Key Management**: The Azure OpenAI API key is configured as an environment variable rather than being hardcoded in the source files. This follows security best practices by separating sensitive credentials from the codebase.

**Network Access**: The Flask application is configured to listen on all interfaces (`0.0.0.0`) to allow external access. In a production environment, this should be combined with proper firewall rules and potentially a reverse proxy for additional security layers.

**CORS Configuration**: Cross-Origin Resource Sharing (CORS) is enabled to allow the frontend application to communicate with the backend API. The current configuration allows requests from any origin, which is suitable for development but should be restricted to specific domains in production.

### Monitoring and Maintenance

**Log Monitoring**: The backend service logs all activity to `/root/leetvibe-backend/backend.log`. This file contains startup messages, request logs, error messages, and other diagnostic information. Regular monitoring of this log file is essential for maintaining service health and troubleshooting issues.

**Process Management**: The backend runs as a background process. To check if the service is running, you can use the following command on the remote server:

```bash
ps aux | grep "python src/main.py" | grep -v grep
```

**Service Restart**: If the backend service needs to be restarted, you can stop the existing process and start a new one:

```bash
# Stop the existing process
pkill -f "python src/main.py"

# Start the service again
cd /root/leetvibe-backend
export AZURE_OPENAI_API_KEY=\'your_api_key_here\'
nohup python src/main.py > backend.log 2>&1 &
```

### API Endpoints

The deployed backend provides several API endpoints that the frontend application uses:

**Health Check**: `GET /api/health` - Returns the service status and can be used for monitoring.

**Questions Management**: 
- `GET /api/questions` - Retrieves all available coding questions
- `GET /api/questions/<question_id>` - Retrieves a specific question by ID

**Code Execution**: `POST /api/execute-code` - Executes user-submitted code and returns the output.

**Test Runner**: `POST /api/run-tests` - Runs test cases against user-submitted code and returns detailed results.

**AI Assistance**: `POST /api/ai-assist` - Provides AI-powered coding assistance using Azure OpenAI.

### Future Enhancements

While the current deployment is functional for development and testing purposes, several enhancements would be beneficial for a production environment:

**Production WSGI Server**: Replace the Flask development server with a production-grade WSGI server like Gunicorn or uWSGI for better performance and reliability.

**Reverse Proxy**: Implement a reverse proxy using Nginx or Apache to handle SSL termination, load balancing, and additional security features.

**Container Orchestration**: Consider containerizing the application using Docker and potentially using container orchestration platforms like Docker Compose or Kubernetes for better scalability and management.

**Database Integration**: While the current implementation uses in-memory storage for questions, a production deployment would benefit from a persistent database solution like PostgreSQL or MongoDB.

**Monitoring and Alerting**: Implement comprehensive monitoring using tools like Prometheus and Grafana, along with alerting systems to notify administrators of service issues.

## Comprehensive Vercel Deployment Guide

Vercel is a cloud platform that specializes in frontend deployment and serverless functions, making it an ideal choice for deploying the LeetVibe frontend application. This comprehensive guide will walk you through the entire process of deploying your React-based frontend to Vercel, from initial setup to production deployment and ongoing maintenance.

### Understanding Vercel

Vercel provides a seamless deployment experience for modern web applications, particularly those built with React, Next.js, Vue.js, and other popular frontend frameworks. The platform offers several key advantages that make it particularly suitable for the LeetVibe frontend:

**Automatic Deployments**: Vercel integrates directly with GitHub repositories, automatically triggering new deployments whenever code is pushed to the main branch. This creates a continuous deployment pipeline that ensures your live application always reflects the latest changes in your repository.

**Global Content Delivery Network (CDN)**: Vercel automatically distributes your application across a global network of edge servers, ensuring fast loading times for users regardless of their geographic location. This is particularly important for a coding platform like LeetVibe, where users expect responsive interfaces and quick feedback.

**Zero Configuration**: For most React applications, Vercel requires minimal configuration. It automatically detects the framework, installs dependencies, builds the application, and deploys it to production-ready infrastructure.

**Custom Domains and SSL**: Vercel provides free SSL certificates and supports custom domain configuration, allowing you to deploy your application with a professional domain name and secure HTTPS connections.

### Prerequisites for Deployment

Before beginning the deployment process, ensure you have the following prerequisites in place:

**GitHub Repository**: Your LeetVibe frontend code must be available in a GitHub repository. Since we\'ve already pushed the code to `https://github.com/Vibetest-hq/leetvibe-platform`, this requirement is satisfied.

**Vercel Account**: You\'ll need a Vercel account, which can be created for free at `https://vercel.com`. Vercel offers generous free tier limits that are more than sufficient for most development and small-scale production deployments.

**Node.js and pnpm**: While not strictly required for deployment (Vercel handles the build process), having these tools locally allows you to test the build process and troubleshoot any issues before deployment.

### Step-by-Step Deployment Process

**Step 1: Account Setup and Repository Connection**

Begin by navigating to the Vercel website and creating an account if you don\'t already have one. Vercel offers multiple authentication options, including GitHub, GitLab, and Bitbucket integration. For the LeetVibe project, GitHub integration is recommended since the repository is hosted on GitHub.

Once your account is created, you\'ll be directed to the Vercel dashboard. Click on the "New Project" button to begin the deployment process. Vercel will prompt you to connect your GitHub account if you haven\'t already done so. This connection allows Vercel to access your repositories and set up automatic deployments.

After connecting your GitHub account, you\'ll see a list of your repositories. Locate the `leetvibe-platform` repository and click "Import" next to it. If you don\'t see the repository immediately, you may need to configure the GitHub App permissions to grant Vercel access to the Vibetest-hq organization.

**Step 2: Project Configuration**

Once you\'ve selected the repository, Vercel will analyze the codebase and attempt to automatically detect the framework and configuration. For the LeetVibe frontend, Vercel should correctly identify it as a React application built with Vite.

However, since the repository contains both frontend and backend code, you\'ll need to specify the root directory for the frontend application. In the project configuration screen:

1.  Set the **Root Directory** to `leetvibe-frontend`. This tells Vercel to treat the `leetvibe-frontend` subdirectory as the root of the application.
2.  Verify that the **Framework Preset** is set to "Vite" or "Other" (Vite applications are typically detected correctly).
3.  Confirm that the **Build Command** is set to `pnpm build` or `npm run build`. Since the project uses pnpm, `pnpm build` is preferred.
4.  Ensure the **Output Directory** is set to `dist`, which is the default output directory for Vite applications.

**Step 3: Environment Variables Configuration**

The LeetVibe frontend needs to communicate with the backend API, which requires configuring the API base URL as an environment variable. In the Vercel project configuration:

1.  Navigate to the "Environment Variables" section.
2.  Add a new environment variable with the key `VITE_API_BASE_URL` and the value `http://45.129.182.243:5000/api`.
3.  Ensure this variable is available for all environments (Production, Preview, and Development).

This environment variable allows the frontend to dynamically configure the API endpoint based on the deployment environment. You\'ll also need to update the frontend code to use this environment variable instead of the hardcoded localhost URL.

**Step 4: Frontend Code Modifications**

Before deployment, you need to modify the frontend code to use the environment variable for the API base URL. In the `leetvibe-frontend/src/App.jsx` file, update the API_BASE_URL constant:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000/api\'
```

This change ensures that the frontend will use the production backend URL when deployed to Vercel, while still allowing local development with the localhost backend.

**Step 5: Deployment Execution**

After configuring the project settings and environment variables, click the "Deploy" button to initiate the deployment process. Vercel will:

1.  Clone the repository to its build environment
2.  Navigate to the specified root directory (`leetvibe-frontend`)
3.  Install dependencies using the detected package manager (pnpm)
4.  Execute the build command to create the production-optimized application
5.  Deploy the built application to Vercel\'s global CDN

The deployment process typically takes 2-5 minutes, depending on the complexity of the application and the number of dependencies. You can monitor the progress in real-time through the Vercel dashboard, which provides detailed logs of each step in the build and deployment process.

**Step 6: Deployment Verification**

Once the deployment completes successfully, Vercel will provide you with a unique URL where your application is accessible. The URL will follow the format `https://leetvibe-platform-[random-string].vercel.app`. 

Visit this URL to verify that the deployment was successful. Test the key functionality:

1.  Verify that the application loads correctly and displays the LeetVibe interface
2.  Check that questions are loading from the backend API
3.  Test the code editor functionality
4.  Attempt to run code and verify that it communicates with the backend
5.  Test the AI assistance feature (noting that it may show errors if the Azure OpenAI credentials need verification)

### Custom Domain Configuration

While the default Vercel URL is functional, you may want to configure a custom domain for a more professional appearance. Vercel makes this process straightforward:

**Domain Purchase or Configuration**: If you don\'t already have a domain, you can purchase one through Vercel or use an existing domain from any registrar.

**DNS Configuration**: For domains purchased elsewhere, you\'ll need to configure the DNS settings to point to Vercel\'s servers. This typically involves:

1.  Adding a CNAME record that points your domain to `cname.vercel-dns.com`
2.  Or adding A records that point to Vercel\'s IP addresses (which can be found in the Vercel documentation)

**SSL Certificate**: Vercel automatically provisions and manages SSL certificates for custom domains, ensuring your application is served over HTTPS without any additional configuration.

### Continuous Deployment and Git Integration

One of Vercel\'s most powerful features is its seamless integration with Git workflows. Once your project is deployed, Vercel automatically:

**Monitors Repository Changes**: Vercel watches your GitHub repository for new commits and automatically triggers deployments when changes are detected.

**Branch Deployments**: Every branch in your repository gets its own deployment URL, allowing you to test features and changes before merging them into the main branch.

**Pull Request Previews**: When you create a pull request, Vercel automatically deploys the changes and provides a preview URL, making it easy to review and test changes before they go live.

**Rollback Capabilities**: Vercel maintains a history of all deployments, allowing you to quickly rollback to a previous version if issues are discovered in production.

### Performance Optimization

Vercel provides several built-in performance optimizations that benefit the LeetVibe frontend:

**Automatic Code Splitting**: Vercel optimizes the build process to create smaller, more efficient bundles that load faster for end users.

**Image Optimization**: If your application includes images, Vercel can automatically optimize them for different screen sizes and formats.

**Caching Strategies**: Vercel implements intelligent caching strategies that balance performance with the need for fresh content.

**Edge Functions**: For more advanced use cases, Vercel supports edge functions that can run code closer to your users for improved performance.

### Monitoring and Analytics

Vercel provides comprehensive monitoring and analytics capabilities:

**Real-time Analytics**: Track page views, user interactions, and performance metrics through the Vercel dashboard.

**Performance Insights**: Monitor Core Web Vitals and other performance metrics to ensure your application provides an excellent user experience.

**Error Tracking**: Vercel can integrate with error tracking services to help you identify and resolve issues quickly.

**Build Logs**: Detailed build logs help you troubleshoot deployment issues and optimize your build process.

### Troubleshooting Common Issues

**Build Failures**: If the deployment fails during the build process, check the build logs for specific error messages. Common issues include missing dependencies, TypeScript errors, or environment variable problems.

**API Connection Issues**: If the frontend can\'t connect to the backend, verify that the `VITE_API_BASE_URL` environment variable is correctly configured and that the backend server is accessible from the internet.

**CORS Errors**: Cross-origin request issues can occur if the backend doesn\'t properly configure CORS headers. Ensure the Flask backend includes the appropriate CORS configuration to allow requests from the Vercel domain.

**Performance Issues**: If the application loads slowly, consider optimizing images, reducing bundle sizes, or implementing code splitting strategies.

### Security Considerations

**Environment Variables**: Never include sensitive information like API keys in the frontend code, as it will be visible to users. Use environment variables only for non-sensitive configuration like API endpoints.

**HTTPS Enforcement**: Vercel automatically enforces HTTPS for all deployments, ensuring secure communication between users and your application.

**Content Security Policy**: Consider implementing Content Security Policy headers to protect against cross-site scripting attacks.

### Cost Considerations

Vercel\'s free tier is generous and suitable for most development and small-scale production deployments:

**Free Tier Limits**: The free tier includes 100GB of bandwidth per month, unlimited personal projects, and automatic SSL certificates.

**Scaling Options**: If your application grows beyond the free tier limits, Vercel offers paid plans with increased bandwidth, team collaboration features, and advanced analytics.

**Monitoring Usage**: Regularly monitor your usage through the Vercel dashboard to ensure you stay within your plan limits and understand your application\'s resource consumption.

This comprehensive deployment guide ensures that your LeetVibe frontend is properly deployed to Vercel with optimal configuration for performance, security, and maintainability. The automated deployment pipeline will keep your application up-to-date as you continue to develop and improve the platform.

