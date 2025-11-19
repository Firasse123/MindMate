# MindMate

## 📌 Overview
MindMate is a comprehensive monorepo solution that develops an AI module for creation, classification, evaluation of educational sheets (fiches) and personalized revision support. This system combines intelligent content generation with adaptive learning algorithms to provide students with tailored educational materials and study assistance.



# Clone the repository
git clone https://github.com/Firasse123/MindMate.git

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
cd Frontend 
npm run dev

# Run backend only
cd Backend
npm run dev

# Run AI services only
cd ai-services
uvicorn main:app --reload




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
├── docs/                        # Project
configurations
├── .github/                     # GitHub workflows
├── package.json                 # Root package.json for workspace
└── README.md
```
