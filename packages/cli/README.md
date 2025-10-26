# @xbot/now

A CLI tool for quickly creating React projects and RDC components.

## Features

- Create React applications with Vite
- Create RDC components with Vite or Webpack
- Support Qiankun micro-frontend integration
- TypeScript support
- TailwindCSS integration
- Modern development setup

## Installation

```bash
npm install -g @xbot/now
# or
yarn global add @xbot/now
# or
pnpm add -g @xbot/now
```

## Usage

```bash
# Create a new project
now create

# Follow the prompts to configure your project
```

## Project Types

### App Project

```
your-app/
├── src/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### RDC Component

```
your-rdc/
├── src/
│   ├── demo/
│   │   └── index.tsx
│   └── index.ts
├── scripts/
├── package.json
├── tsconfig.json
├── vite.config.ts (or webpack.config.js)
└── rollup.config.js
```

## Development

```bash
# Clone the repository
git clone https://github.com/your-org/now.git

# Install dependencies
pnpm install

# Build the package
pnpm build

# Link the package locally
pnpm link --global
```

## License

MIT 