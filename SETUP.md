# AI-Powered Knowledge Base - Setup Instructions

## Prerequisites

- Python 3.8+ 
- Google AI API Key (for Gemini LLM)
- Git

## Quick Setup

### 1. Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd AI-Powered-Knowledge-Base-Search-amp-Enrichment
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Set Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# Required: Get your API key from https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Customize these paths
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
API_HOST=0.0.0.0
API_PORT=8000
```

#### Start the Backend Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### 3. Frontend Setup

#### Option A: Simple File Server
```bash
cd frontend
python -m http.server 3000
```
Then open: `http://localhost:3000`

#### Option B: Direct File Access
Simply open `frontend/index.html` in your web browser.

### 4. Test the Application

1. **Upload Documents**: Go to the frontend and upload PDF, DOCX, or TXT files
2. **Search**: Ask questions about your uploaded documents
3. **Auto-Enrichment**: Check the "Auto-enrich" checkbox for enhanced results

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed system status  
- `POST /upload` - Upload documents
- `POST /search` - Search with natural language
- `GET /documents/count` - Get document count
- `DELETE /documents/reset` - Reset knowledge base

## Features

### Core Functionality
- ✅ Document Upload (PDF, DOCX, TXT)
- ✅ Natural Language Search
- ✅ AI-Generated Answers with Confidence Levels
- ✅ Missing Information Detection
- ✅ Enrichment Suggestions

### Advanced Features
- ✅ Structured JSON Responses
- ✅ Auto-Enrichment for Missing Data
- ✅ Source Citations with Relevance Scores
- ✅ Processing Time Metrics
- ✅ Enhanced User Interface

## Troubleshooting

### Common Issues

1. **"No module named 'app'" Error**
   - Make sure you're running from the `backend/` directory
   - Check that all dependencies are installed: `pip install -r requirements.txt`

2. **"GOOGLE_API_KEY not found" Error**
   - Create a `.env` file in the `backend/` directory
   - Add your Google AI API key: `GOOGLE_API_KEY=your_key_here`

3. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check that CORS is enabled (it is by default)
   - Try accessing backend directly: `http://localhost:8000/health`

4. **Document upload fails**
   - Check file format (only PDF, DOCX, TXT supported)
   - Ensure file size is reasonable (< 50MB)
   - Check backend logs for specific error messages

### Performance Tips

- **Large Documents**: The system chunks documents automatically, but very large files may take time to process
- **Search Quality**: Use specific, clear questions for better results
- **Auto-Enrichment**: Enable for better completeness detection

## Development

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── rag_pipeline.py      # RAG implementation
│   ├── document_processor.py # Document processing
│   ├── vector_store.py      # ChromaDB integration
│   └── logger.py           # Logging configuration
├── requirements.txt         # Python dependencies
└── config.py              # Configuration management

frontend/
├── index.html              # Main HTML file
├── app.js                  # Frontend JavaScript
├── api.js                  # API communication
└── styles.css              # Styling
```

### Adding New Features

1. **Backend**: Add new endpoints in `app/main.py`
2. **Models**: Update `app/models.py` for new data structures
3. **Frontend**: Modify `frontend/app.js` for new UI features

## Production Deployment

### Environment Variables for Production
```bash
# Security
GOOGLE_API_KEY=your_production_key
CORS_ORIGINS=["https://yourdomain.com"]

# Performance
LOG_LEVEL=WARNING
MAX_FILE_SIZE_MB=100

# Database
CHROMA_DB_PATH=/var/lib/chroma
```

### Docker Deployment (Optional)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at `http://localhost:8000/docs`
3. Check backend logs for detailed error messages
