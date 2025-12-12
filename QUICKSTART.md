# Agent Battalion - Quick Start Guide

Welcome to Agent Battalion! This guide will help you get up and running in under 5 minutes.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4000`

That's it! You're ready to generate apps.

## 🎯 How to Use

### Generating Your First App

1. In the web interface, enter your app specification in the text area. For example:
   ```
   Build a modern blog with authentication, markdown support, and comments. 
   Include a dark mode toggle and admin dashboard.
   ```

2. Click the **"Generate App"** button

3. Watch the real-time progress as Agent Battalion:
   - Analyzes your specification
   - Plans the application structure
   - Generates Next.js 15 files
   - Creates configuration files
   - Sets up Tailwind CSS

4. Once complete:
   - Browse the generated files in the right panel
   - Click any file to preview its contents
   - Click **"Download ZIP"** to get your complete app

### Example Specifications

Try these examples to see Agent Battalion in action:

**E-commerce Store:**
```
Create an e-commerce store with product catalog, shopping cart, 
checkout flow, and user authentication.
```

**Dashboard App:**
```
Build an analytics dashboard with charts, data tables, 
real-time updates, and user management.
```

**Chat Application:**
```
Create a chat app with real-time messaging, user profiles, 
and channel management.
```

**Portfolio Site:**
```
Build a personal portfolio with project showcase, 
blog section, and contact form.
```

## 📁 Generated App Structure

Each generated app includes:

```
generated-app/
├── package.json           # Next.js 15 + React 19 dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── app/
│   ├── layout.tsx         # Root layout with dark theme
│   ├── page.tsx           # Home page with your features
│   └── globals.css        # Global styles
├── .gitignore            # Git ignore rules
└── README.md             # App-specific documentation
```

## 🔧 Running Your Generated App

After downloading and extracting your app:

1. **Navigate to the app directory:**
   ```bash
   cd generated-app
   unzip generated-app.zip
   cd generated-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🎨 Features

### Current (Phase 1)
- ✅ Real-time progress updates via WebSocket
- ✅ Dark-themed, modern UI
- ✅ Next.js 15 + React 19 generation
- ✅ TypeScript support
- ✅ Tailwind CSS integration
- ✅ File preview and download
- ✅ Feature detection from specifications

### Coming Soon (Future Phases)
- 🔄 LangGraph agent integration
- 🔄 Temporal workflow orchestration
- 🔄 E2B sandbox execution
- 🔄 Multiple framework support
- 🔄 Custom component libraries
- 🔄 Database integration
- 🔄 API generation
- 🔄 Testing setup

## 🐛 Troubleshooting

### Port already in use
If port 4000 is already in use, update the `PORT` in `.env`:
```bash
PORT=4001
```

### Dependencies not installing
Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Server not starting
Check if you have Node.js 18+ installed:
```bash
node --version
```

### WebSocket connection issues
Make sure no firewall is blocking port 4000, and check that the server is running.

## 📚 Documentation

- [README.md](./README.md) - Main documentation
- [Docker Setup](./docker-compose.yml) - Docker configuration for future phases
- [Environment Variables](./.env) - Configuration options

## 🤝 Tips for Best Results

1. **Be specific** - The more details you provide, the better the generated app
2. **Mention features** - Explicitly list features you want (auth, database, etc.)
3. **Name your app** - Include a name in your specification for better results
4. **Iterate** - Generate, review, and refine your specifications

## 🎯 Next Steps

1. Generate a few apps to understand the capabilities
2. Explore the generated code to see the patterns
3. Customize the generated apps to your needs
4. Check back for Phase 2 updates with AI agent integration!

## 📞 Support

For issues, feature requests, or questions:
- Check the [README.md](./README.md) for detailed documentation
- Review example specifications above
- Examine the generated code for patterns

---

**Happy coding! 🚀**

Generated apps are yours to use, modify, and deploy however you like.
