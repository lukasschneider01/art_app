# Deployment Guide

## Prerequisites
1. GitHub account
2. MongoDB Atlas account
3. Render.com or Railway.com account
4. Netlify or Vercel account

## Step 1: Database Setup (MongoDB Atlas)
1. Create a free MongoDB Atlas account
2. Create a new cluster (free tier)
3. Set up database access (username and password)
4. Configure network access (allow connections from anywhere for development)
5. Get the MongoDB connection string

## Step 2: Backend Deployment (Render/Railway)
1. Push your code to a GitHub repository
2. Sign up for Render.com or Railway.com
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password
   - `NODE_ENV`: "production"
6. Set the build command: `npm install`
7. Set the start command: `node server.js`

## Step 3: Frontend Deployment (Netlify/Vercel)
1. Update the API base URL in the frontend code to point to your deployed backend
2. Create an account on Netlify or Vercel
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
5. Set environment variables if needed

## Step 4: Domain Setup (Free Options)
1. Get a free domain from Freenom (e.g., .tk, .ml, .ga, .cf, .gq)
2. Configure DNS settings in your domain registrar
3. Add custom domain in Netlify/Vercel
4. Wait for DNS propagation

## Step 5: Final Configuration
1. Update CORS settings in backend to allow your new domain
2. Test all functionality:
   - User registration
   - Email notifications
   - Survey submission
   - Admin dashboard
3. Monitor application logs and performance

## Important Notes
- Keep your environment variables secure
- Regularly backup your database
- Monitor free tier usage limits
- Set up proper error logging
- Configure automatic deployments

## Troubleshooting
1. If emails aren't sending, verify email service configuration
2. For database connection issues, check MongoDB Atlas network settings
3. For frontend routing issues, configure proper redirect rules
4. For file upload problems, verify storage configuration

## Maintenance
1. Regularly update dependencies
2. Monitor error logs
3. Backup database periodically
4. Check resource usage to stay within free tier limits