# Lawruk.com

Lawruk.com has existed as my personal website for over 25 years. It started as a static HTML/CSS web site is now built with .NET Core and Angular.

## Tech stack

- .NET 10 Web app
- Angular 20 front-end
- TypeScript
- Static race and recipe content

## Prerequisites

- .NET 10 SDK
- Node.js and npm

## Run locally

From the repository root:

```bash
dotnet restore
npm install
cd client-app
npm install
cd ..
dotnet run
```

This runs the ASP.NET app, which serves the Angular app and fallback routes.

If you prefer to run the Angular front-end separately for development:

```bash
cd client-app
npm install
npm start
```

This runs the front-end locally on http://localhost:4200/

## Publish

For a Windows publish:

```bash
dotnet publish -c Release -r win-x64 -p:PublishReadyToRun=true --self-contained false
```

This builds the Angular client and packages the ASP.NET site for deployment.

You can also publish more generically with:

```bash
dotnet publish -c Release
```
