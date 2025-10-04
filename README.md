# AI-Powered Knowledge Base Search & Enrichment

A comprehensive RAG (Retrieval-Augmented Generation) system that allows users to upload documents, search them using natural language, and get AI-generated answers with intelligent enrichment suggestions.

## Features

### Core Functionality
- **Document Upload & Storage**: Support for PDF, DOCX, and TXT files
- **Natural Language Search**: Ask questions in plain language
- **AI-Generated Answers**: Get intelligent responses using retrieved documents
- **Completeness Detection**: AI identifies when information is missing or uncertain
- **Enrichment Suggestions**: Get recommendations to improve the knowledge base

### Advanced Features
- **Structured JSON Output**: Responses include confidence levels, missing information, and enrichment suggestions
- **Auto-Enrichment**: Automatic fetching of missing data from external sources
- **Source Citations**: Detailed information about which documents were used
- **Processing Metrics**: Track processing time and performance
- **Enhanced UI**: Modern, responsive interface with real-time feedback

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
export GOOGLE_API_KEY=your_api_key_here
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
# Open index.html in your browser
# Or serve with a simple HTTP server:
python -m http.server 3000
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed system status
- `POST /upload` - Upload documents (PDF, DOCX, TXT)
- `POST /search` - Search with natural language queries
- `GET /documents/count` - Get document count
- `GET /documents/list` - List all documents
- `DELETE /documents/reset` - Reset knowledge base

## Search Query Format

```json
{
  "query": "What is machine learning?",
  "top_k": 5,
  "include_auto_enrichment": true
}
```

## Response Format

```json
{
  "query": "What is machine learning?",
  "answer": "Machine learning is...",
  "confidence": "high",
  "sources": [...],
  "missing_info": [...],
  "enrichment_suggestions": [...],
  "retrieved_chunks": 5,
  "processing_time": 1.23,
  "auto_enrichment": {...},
  "reasoning": "Strong evidence found in multiple documents"
}
```

## Requirements Met

✅ **Core Requirements**
- Document Upload & Storage
- Natural Language Search
- AI-Generated Answers
- Completeness Detection
- Enrichment Suggestions

✅ **Stretch Goals**
- Structured JSON output with confidence levels
- Auto-enrichment for missing data
- Enhanced user interface
- Performance metrics and monitoring
