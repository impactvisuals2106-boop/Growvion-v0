# Growvion Website

This is the official front-end repository for the Growvion startup website. It is built using **React** (via Vite) and **Vanilla CSS** for a highly customized, sleek, and dynamic aesthetic (glassmorphism, neon accents).

## Prerequisites

Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher recommended)
- npm (Node Package Manager)

## How to Run the Project Locally

Follow these steps to get the project up and running on your local machine:

### 1. Install Dependencies
Open your terminal in the root directory of the project and run:
```bash
npm install
```

### 2. Start the Development Server
Once the dependencies are installed, start the Vite development server by running:
```bash
npm run dev
```

### 3. View the Site
Open your browser and navigate to the local URL provided in your terminal (usually `http://localhost:5173/`).

## Building for Production

To create a production-ready build of the website, run:
```bash
npm run build
```
This will generate optimized static assets in the `dist` folder, ready to be deployed.

## Built With
- **[React](https://react.dev/)**: JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling for rapid development.
- **Vanilla CSS**: Custom design system built with CSS variables and modern properties.

## Deploying to GitHub

To push this project to the GitHub repository for the first time, run the following commands in your terminal from the project root:

```bash
echo "# Growvion-v0" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/impactvisuals2106-boop/Growvion-v0.git
git push -u origin main
```

For subsequent pushes after making changes:
```bash
git add .
git commit -m "your commit message"
git push
```

## Deploying to Vercel

This project is pre-configured for Vercel via `vercel.json`. Simply connect the GitHub repository to a new Vercel project and it will automatically build and deploy on every push to `main`.
"# Growvion-v0" 
