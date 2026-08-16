# 🌱 AgriAI - Smart Farming Assistant

A comprehensive AI-powered agricultural platform that helps farmers make data-driven decisions through crop disease detection, soil analysis, and weather-based crop recommendations.

## ✨ Features

### 🔐 **Authentication & User Management**

- Secure user registration and login
- JWT-based authentication
- User profiles with farming details
- Password management

### 📸 **Crop Disease Detection**

- AI-powered image analysis using Google Gemini
- Disease and pest identification
- Severity assessment with confidence scores
- Treatment recommendations with priority levels
- Detailed symptom and cause analysis
- **Image history**: Uploaded images are stored with the analysis and viewable later

### 🧪 **Soil Fertility Analysis**

- Soil composition analysis from images
- Nutrient level assessment (N-P-K + pH)
- Soil type identification
- Crop suitability recommendations
- Improvement suggestions
- **Image history**: Uploaded images are stored with the analysis and viewable later

### 🌤️ **Weather Integration & Crop Recommendations**

- Real-time weather data from OpenWeatherMap
- Agricultural weather metrics
- Growing degree days calculation
- Frost and drought risk assessment
- AI-powered crop recommendations based on weather and soil data

### 📊 **Comprehensive Reporting**

- Analysis history and tracking
- Dashboard with farm health metrics
- Export capabilities
- Progress monitoring

## 🛠️ Technology Stack

### Backend

- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **AI Integration**: Google Generative AI (Gemini)
- **Weather API**: OpenWeatherMap
- **File Upload**: Multer
- **Security**: Helmet, CORS

### Frontend

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database
- Google AI Studio API key
- OpenWeatherMap API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd photo-crop-ai
   ```

2. **Backend Setup**

   ```bash
   cd server
   pnpm install
   cp .env.example .env
   # Edit .env with your configuration
   pnpm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   pnpm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   pnpm run dev
   ```

### Environment Configuration

#### Backend (.env)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/agricultural-ai
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

GOOGLE_AI_API_KEY=your-google-ai-studio-api-key-here
WEATHER_API_KEY=your-openweathermap-api-key-here
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📱 Usage

### 1. **User Registration**

- Create an account with farming details
- Set preferences for units and notifications

### 2. **Disease Detection**

- Upload crop images
- Get AI analysis with disease identification
- Receive treatment recommendations

### 3. **Soil Analysis**

- Upload soil sample images
- Get fertility and composition analysis
- Receive crop suitability recommendations

### 4. **Weather & Crop Planning**

- Check weather conditions
- Get agricultural insights
- Receive AI-powered crop recommendations

### 5. **Reports & History**

- View analysis history
- Track farm health metrics
- Monitor progress over time

## 🏗️ Project Structure

```
photo-crop-ai/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js         # Express app setup
│   ├── uploads/           # File uploads
│   └── package.json
├── client/                # Frontend application
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and API
│   ├── types/            # TypeScript types
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile

### Disease Analysis

- `POST /api/disease/analyze` - Analyze crop disease
- `GET /api/disease` - Get user's analyses
- `GET /api/disease/:id` - Get specific analysis
- `DELETE /api/disease/:id` - Delete analysis

### Soil Analysis

- `POST /api/soil/analyze` - Analyze soil fertility
- `GET /api/soil` - Get user's analyses
- `GET /api/soil/:id` - Get specific analysis

### Weather & Recommendations

- `GET /api/weather/current` - Current weather
- `GET /api/weather/agricultural` - Agricultural weather data
- `POST /api/weather/crop-recommendations` - Get crop recommendations

### Reports

- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports` - All user reports

## 🤖 AI Integration

### Google Generative AI (Gemini)

- **Crop Disease Detection**: Analyzes images to identify diseases, pests, and health issues
- **Soil Analysis**: Evaluates soil fertility, composition, and suitability
- **Crop Recommendations**: Provides weather-based crop suggestions

### Features

- High-accuracy image analysis
- Detailed confidence scores
- Actionable recommendations
- Multi-language support

## 🔒 Privacy & Security

### Image Processing

- **Stored for reference**: Uploaded crop and soil images are stored with their analysis so you can review them later in history.
- **Owner-scoped access**: Images are served only to the authenticated user who created the analysis.
- **Secure Processing**: Images are processed via Google Gemini and are not shared with third parties.

## 🌐 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy to platforms like Railway, Render, or AWS

### Frontend Deployment

1. Build the Next.js application
2. Deploy to Vercel, Netlify, or similar platforms
3. Configure environment variables

## 🧪 Testing

### Backend Testing

```bash
cd server
pnpm test
```

### Frontend Testing

```bash
cd client
pnpm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI Studio for powerful image analysis
- OpenWeatherMap for weather data
- The open-source community for amazing tools and libraries

## 📞 Support

For support, email support@agriai.com or create an issue in the repository.

---

**Built with ❤️ for farmers worldwide** 🌾
