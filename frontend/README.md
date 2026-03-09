# DeepTech Frontend

This is the frontend application for DeepTech - a comprehensive platform for regulatory compliance and whitepaper generation for the fintech industry.

## Prerequisites

- Node.js (>= 18.x.x)
- npm or yarn

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory with the following variables:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AUTH0_AUDIENCE=https://esf-dash-rag-api
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Docker Deployment

The frontend is containerized using Docker with nginx. See the main project README for deployment instructions.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_AUTH0_AUDIENCE` - Auth0 API audience identifier

## Authentication

This application uses Auth0 for authentication. All protected routes require users to be authenticated.
