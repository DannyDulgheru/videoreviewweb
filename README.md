# Video Review Web

A Next.js video review platform for sharing videos and collecting timestamped feedback.

## Features

- Upload videos and create multiple versions
- Add timestamped comments on videos
- Share video review links
- Project-based video organization

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment to Railway

This project is configured for Railway deployment with persistent storage.

### Prerequisites

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

### Deploy Steps

1. **Initialize Railway project:**
   ```bash
   railway init
   ```

2. **Create a persistent volume for uploads:**
   ```bash
   railway volume create
   ```
   
   When prompted, configure:
   - **Mount path:** `/app/uploads`
   - **Size:** At least 1GB (adjust based on needs)

3. **Link the volume to your service** (in Railway dashboard):
   - Go to your project → Service → Variables
   - Add volume mount: `/app/uploads`

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Set environment variables** (optional):
   ```bash
   railway variables set NODE_ENV=production
   ```

### Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway will auto-detect the Dockerfile and deploy
6. **Important:** Add a volume mount at `/app/uploads` in the service settings

### Volume Configuration

The application stores data in `/app/uploads` with this structure:
```
/app/uploads/
  ├── videos/      # Uploaded video files
  ├── comments/    # Comment JSON files (per project)
  ├── metadata/    # Project metadata JSON files
  └── thumbnails/  # Video thumbnails
```

**Note:** Without a persistent volume, uploaded files will be lost on each deployment.

## Environment Variables

- `PORT` - Server port (automatically set by Railway)
- `NODE_ENV` - Environment mode (production/development)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Radix UI components
- Firebase (optional)
