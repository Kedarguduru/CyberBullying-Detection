# CyberSecurity Bullying Detection Platform

A comprehensive AI-powered platform for detecting and analyzing cyberbullying across text, images, videos, and audio.

## 🚀 Quick Deploy to Render

### Prerequisites
- Render account
- MongoDB Atlas account
- Google OAuth credentials
- SMTP email service (Gmail recommended)

### One-Click Deployment

1. **Fork this repository** to your GitHub account

2. **Deploy Backend**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your forked repository
   - Configure:
     - **Name**: `cyberbullying-backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

3. **Add Backend Environment Variables**:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_secure_random_jwt_secret
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

4. **Deploy Frontend**:
   - Click "New" → "Static Site"
   - Connect the same repository
   - Configure:
     - **Name**: `cyberbullying-frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

5. **Add Frontend Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com
   ```

6. **Update URLs**:
   - After both services are deployed, update the backend's `FRONTEND_URL` with the actual frontend URL
   - Update the frontend's `REACT_APP_API_URL` with the actual backend URL

## Features

- **Text Analysis**: Advanced ML models for detecting bullying in text messages
- **Image OCR**: Extract and analyze text from images
- **Video Analysis**: Process video files and transcribe audio for bullying detection
- **Audio Analysis**: Real-time audio chunk analysis
- **Document Analysis**: Scan PDFs, DOCX, and TXT files
- **Real-time Dashboard**: Live monitoring and analytics
- **User Authentication**: Secure login with OTP and Google OAuth

## Tech Stack

- **Backend**: Python Flask with MongoDB
- **Frontend**: React.js with modern UI
- **AI/ML**: Scikit-learn, OpenAI Whisper, Tesseract OCR
- **Database**: MongoDB Atlas
- **Deployment**: Render (Backend API + Frontend Static Site)

## Local Development

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB Atlas account
- Google OAuth credentials
- SMTP email service (Gmail recommended)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   ```

4. Run the backend:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API URL in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start development server:
   ```bash
   npm start
   ```

## Deployment on Render

### Backend Deployment

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
4. **Add Environment Variables**:
   - `MONGODB_URI`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `PORT` (automatically set by Render)
5. **Deploy**

### Frontend Deployment

1. **Create a new Static Site** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. **Add Environment Variable**:
   - `REACT_APP_API_URL` = `https://your-backend-service.onrender.com`
5. **Deploy**

### Post-Deployment Configuration

1. Update the frontend's `REACT_APP_API_URL` with the actual backend URL
2. Ensure CORS is properly configured in the backend
3. Test all endpoints are working

## API Endpoints

- `POST /register` - User registration with OTP
- `POST /verify-otp` - OTP verification
- `POST /google-login` - Google OAuth login
- `POST /predict` - Text bullying detection
- `POST /predict-video` - Video analysis
- `POST /predict-audio-chunk` - Audio analysis
- `POST /analyze-image` - Image OCR and analysis
- `POST /analyze-document` - Document analysis
- `GET /get-incidents` - Get incident logs
- `GET /get-analytics` - Get analytics data

## Security Features

- JWT-based authentication
- OTP verification
- Google OAuth integration
- Input validation and sanitization
- Rate limiting considerations
- Secure environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.