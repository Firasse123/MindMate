# EIF-IA
**Évaluation Intelligente des Fiches + Assistant IA**

## 📌 Overview
EIF-IA is a comprehensive monorepo solution that develops an AI module for creation, classification, evaluation of educational sheets (fiches) and personalized revision support. This system combines intelligent content generation with adaptive learning algorithms to provide students with tailored educational materials and study assistance.

## ✨ Features
- To be discussed

## 🚀 Quick Start

### Prerequisites
- To be added by developers

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/EIF-IA.git

# Navigate to project directory
cd EIF-IA

# Install dependencies for all modules
npm run install:all

# Set up Python environment for AI services
cd ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running the Project
```bash
# Development (runs frontend, backend, and AI services)
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Run AI services only
npm run dev:ai

# Production with Docker
docker-compose up -d

# Production build
npm run build
npm run start
```

## 🏗️ Monorepo Structure
```
EIF-IA/
├── frontend/                    # React/Vue frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Node.js/Express backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── ai-services/                 # Python AI/ML microservices
│   ├── src/
│   │   ├── creation/            # AI sheet creation engine
│   │   ├── classification/      # Content classification system
│   │   ├── evaluation/          # AI evaluation algorithms
│   │   ├── revision/            # Personalized revision assistant
│   │   └── models/              # ML model definitions
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── shared/                      # Shared types, utilities, constants
│   ├── types/
│   ├── utils/
│   └── constants/
├── docs/                        # Project documentation
├── docker/                      # Docker configurations
├── .github/                     # GitHub workflows
├── docker-compose.yml
├── package.json                 # Root package.json for workspace
└── README.md
```

## 🌿 Git Workflow

### Branch Strategy
- **`main`** - Production-ready code (protected)
- **`develop`** - Integration branch for features
- **`feature/[scope]/[name]`** - New features (e.g., `feature/ai/evaluation-engine`)
- **`bugfix/[scope]/[name]`** - Bug fixes (e.g., `bugfix/frontend/report-validation`)
- **`hotfix/[name]`** - Critical fixes for production

### Creating a New Feature
```bash
# Create and switch to a new feature branch
git checkout -b feature/ai/intelligent-scoring

# Make your changes and commit
git add .
git commit -m "✨ feat(ai): add intelligent scoring algorithm"

# Push to remote
git push origin feature/ai/intelligent-scoring
```

### Staying Up-to-Date
```bash
# Switch to develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Switch back to your feature branch
git checkout feature/ai/intelligent-scoring

# Merge develop into your branch
git merge develop
```

### Creating a Pull Request
1. Push your feature branch to GitHub
2. Open a Pull Request against `develop`
3. Add a clear description of your changes
4. Specify if changes affect frontend, backend, or AI services
5. Request review from team members
6. Ensure CI/CD checks pass
7. Merge after approval

## 📝 Commit Convention
We follow conventional commits with scope for monorepo clarity:

```bash
# Format: <type>(<scope>): <description>
git commit -m "feat(ai): add GPT integration for report generation"
git commit -m "fix(backend): resolve evaluation scoring calculation"
git commit -m "feat(frontend): implement AI chat interface"
git commit -m "docs(shared): update API interface types"
```

### Commit Scopes
- `frontend` - Frontend application changes
- `backend` - Backend API changes
- `ai` - AI services and ML models
- `shared` - Shared utilities/types
- `docker` - Docker/deployment configs
- `docs` - Documentation updates
- `ci` - CI/CD pipeline changes

### Commit Types
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code formatting (no logic changes)
- `refactor` - Code restructuring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

## 🛠️ Development

### Available Scripts
```bash
# Root level scripts
npm run install:all      # Install all dependencies
npm run dev              # Start frontend, backend, and AI services
npm run build            # Build all applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format all code

# Frontend specific
npm run dev:frontend     # Start frontend dev server
npm run build:frontend   # Build frontend for production
npm run test:frontend    # Run frontend tests

# Backend specific
npm run dev:backend      # Start backend dev server
npm run build:backend    # Build backend for production
npm run test:backend     # Run backend tests
npm run migrate          # Run database migrations
npm run seed             # Seed database with test data

# AI Services specific
npm run dev:ai           # Start AI services
npm run train:models     # Train/retrain AI models
npm run test:ai          # Run AI service tests
```

## 🧪 Testing
```bash
# Run all tests (frontend + backend + AI)
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run AI service tests only
npm run test:ai

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose build --no-cache
```

## 🚀 Deployment
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Environment-specific deployment
npm run deploy:staging
npm run deploy:production
```

## 🤝 Contributing

### Development Guidelines
- Follow the established code style for each environment
- Write tests for new features (frontend, backend, and AI)
- Update documentation as needed
- Keep commits focused and atomic
- Use appropriate commit scopes for monorepo clarity

### Before You Start
1. Check if your changes affect frontend, backend, or AI services
2. Create appropriate feature branch with scope
3. Set up local development environment
4. Run existing tests to ensure everything works
5. Make your changes
6. Write/update tests
7. Ensure all tests pass
8. Create a pull request

## 🔧 Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/eif_ia
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret

# AI Services
OPENAI_API_KEY=your_openai_key
AI_MODEL_PATH=./models/
PYTHON_ENV=development

# Frontend
VITE_API_BASE_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

**⚠️ Important Git Rules for Monorepo:**
- Never commit directly to `main`
- Always create feature branches with proper scope
- Use conventional commits with scope (frontend/backend/ai)
- Test both traditional code and AI model outputs
- Keep branches up-to-date with `develop`
- Specify affected areas in PR descriptions
