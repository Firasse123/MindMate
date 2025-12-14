# 🎓 MindMate

<div align="center">

**AI-Powered Educational Platform for Personalized Learning**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue?logo=python)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 📌 Overview

**MindMate** is an intelligent educational platform that leverages AI to revolutionize the learning experience. It provides students with personalized study materials, adaptive quizzes, interactive chatbots, and smart revision tools. The system uses machine learning to create, classify, and evaluate educational content while adapting to each student's unique learning pace and style.

### ✨ Key Features

- 🤖 **AI-Powered Content Generation** - Automatically creates educational sheets (fiches) tailored to specific topics
- 📊 **Adaptive Quiz System** - Generates personalized quizzes based on student performance and knowledge gaps
- 💬 **Intelligent Chatbot** - Interactive learning assistant for instant help and explanations
- 📈 **Progress Tracking** - Comprehensive analytics and visualization of learning progress
- 🎯 **Personalized Learning Paths** - AI-driven curriculum customization based on assessments
- ⏱️ **Study Session Management** - Track study time and optimize learning sessions
- ✅ **Content Evaluation** - AI-powered assessment and feedback on learning materials
- 📧 **Email Notifications** - Automated reminders and progress updates

---

## 🏗️ Architecture

This is a **monorepo project** with three main components working together:

```
EIF-IA/
├── frontend/                    # Next.js 15 + React 19 application
│   ├── src/
│   │   ├── app/                 # Next.js app router pages
│   │   │   ├── chatbot/         # AI chatbot interface
│   │   │   ├── dashboard/       # Student dashboard
│   │   │   ├── generate-quiz/   # Quiz generation
│   │   │   ├── generate-sheet/  # Sheet creation
│   │   │   ├── paths/           # Learning paths
│   │   │   └── sheets/          # Sheet management
│   │   ├── components/          # Reusable UI components
│   │   ├── store/               # Zustand state management
│   │   └── utils/               # Helper functions
│   └── package.json
│
├── Backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── fiche-controller.js
│   │   │   ├── quiz-controller.js
│   │   │   ├── chatbot-controller.js
│   │   │   └── ...
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Fiche.js
│   │   │   ├── Quiz.js
│   │   │   └── ...
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth & validation
│   │   ├── services/            # Business logic
│   │   ├── db/                  # Database connection
│   │   └── email/               # Email templates & config
│   └── server.js
│
├── ai-services/                 # Python FastAPI microservices
│   ├── src/
│   │   ├── creation/            # AI sheet generation
│   │   │   └── generateFiche.py
│   │   ├── classification/      # Content classification
│   │   ├── evaluation/          # AI evaluation
│   │   │   └── evaluateFiche.py
│   │   ├── Quiz/                # Quiz generation
│   │   │   └── createQuiz.py
│   │   └── revision/            # Personalized revision
│   ├── models/                  # ML model definitions
│   └── main.py                  # FastAPI app
│
└── shared/                      # Shared code across services
    ├── types/                   # TypeScript type definitions
    ├── utils/                   # Common utilities
    └── constants/               # App constants
```

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15.5 with App Router
- **UI Library:** React 19.1
- **Styling:** Tailwind CSS 4.1
- **State Management:** Zustand 5.0
- **Animations:** Framer Motion 12
- **Rich Text Editor:** Tiptap 3.4
- **HTTP Client:** Axios 1.11
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4.21
- **Database:** MongoDB with Mongoose 8.17
- **Authentication:** JWT (jsonwebtoken 9.0)
- **Password Hashing:** bcrypt 6.0
- **Email Service:** Nodemailer 6.10 & Mailtrap 4.2
- **AI Integration:** Google Generative AI 0.24
- **File Storage:** ImageKit 6.0
- **Validation:** express-validator 7.2

### AI Services
- **Framework:** FastAPI (Python)
- **ML Libraries:** Hugging Face Transformers, Xenova Transformers
- **AI Models:** Ollama integration
- **Image Processing:** ImageKit

### DevOps & Tools
- **Package Manager:** npm
- **Linting:** ESLint 9
- **Code Formatting:** Prettier 3.6
- **Development:** Nodemon, Hot Reload

---

## 📦 Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (local or Atlas)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/Firasse123/MindMate.git
cd EIF-IA
```

### Step 2: Install Dependencies

#### Option A: Install All at Once (Recommended)
```bash
npm run install:all
```

#### Option B: Manual Installation
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd Backend
npm install
cd ..

# Install Python dependencies for AI services
cd ai-services
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Step 3: Environment Configuration

Create `.env` files in the respective directories:

#### Backend `.env`
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mindmate
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindmate

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Service (Mailtrap/SMTP)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@mindmate.com

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

#### AI Services `.env`
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key
OLLAMA_HOST=http://localhost:11434
```

---

## 🎯 Running the Project

### Development Mode

#### Run All Services (Recommended)
```bash
npm run dev
```

#### Run Services Individually

**Frontend** (Next.js on port 3000)
```bash
cd frontend
npm run dev
```

**Backend** (Express on port 5000)
```bash
cd Backend
npm run dev
```

**AI Services** (FastAPI on port 8000)
```bash
cd ai-services
# Activate virtual environment first
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run server
uvicorn main:app --reload
```

### Production Build

**Frontend**
```bash
cd frontend
npm run build
npm start
```

**Backend**
```bash
cd Backend
npm start
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email` - Verify email address

### Fiches (Study Sheets)
- `GET /api/fiches` - Get all sheets
- `GET /api/fiches/:id` - Get sheet by ID
- `POST /api/fiches` - Create new sheet
- `PUT /api/fiches/:id` - Update sheet
- `DELETE /api/fiches/:id` - Delete sheet
- `POST /api/fiches/generate` - AI-generate sheet

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/generate` - Generate personalized quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/results/:id` - Get quiz results

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history/:userId` - Get chat history
- `DELETE /api/chatbot/history/:userId` - Clear chat history

### Learning Paths
- `GET /api/paths` - Get personalized learning paths
- `POST /api/paths/generate` - Generate new path based on assessment
- `PUT /api/paths/:id` - Update path progress

### Progress & Sessions
- `GET /api/progress/:userId` - Get user progress
- `POST /api/sessions` - Start study session
- `PUT /api/sessions/:id` - End study session
- `GET /api/sessions/stats` - Get session statistics

---

## 📚 Features in Detail

### 1. AI Content Generation
The platform uses advanced AI models to generate high-quality educational content:
- Topic-based sheet generation
- Automatic summarization
- Key concept extraction
- Example generation

### 2. Adaptive Quiz System
Intelligent quiz generation that adapts to student knowledge:
- Difficulty adjustment based on performance
- Topic-specific question generation
- Multiple question types (MCQ, True/False, Short Answer)
- Immediate feedback and explanations

### 3. Personalized Learning Paths
AI-driven curriculum customization:
- Initial assessment to gauge knowledge level
- Dynamic path adjustment based on progress
- Recommended topics and resources
- Achievement tracking

### 4. Study Session Tracking
Comprehensive time management and productivity features:
- Pomodoro timer integration
- Session history and analytics
- Study streak tracking
- Daily/weekly goals

### 5. Interactive Chatbot
AI-powered learning assistant:
- Natural language understanding
- Context-aware responses
- Topic explanations
- Study tips and guidance

---

## 🧪 Testing

```bash
# Run backend tests
cd Backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended to add)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Firasse** - [GitHub](https://github.com/Firasse123)

---

## 🙏 Acknowledgments

- Google Generative AI for AI capabilities
- Hugging Face for transformer models
- Ollama for local AI model support
- MongoDB for database solutions
- Vercel for Next.js framework

---

## 📞 Support

For support, email support@mindmate.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ by the MindMate Team**

⭐ Star us on GitHub — it motivates us a lot!

</div>
