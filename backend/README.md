# Flask Backend API

This is a basic Flask API project with test endpoints.

## Setup Instructions

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

The server will start on http://localhost:5000

## Available Endpoints

1. Test API:
   - GET `/api/test`
   - Returns a test message

2. Data API:
   - POST `/api/data`
   - Accepts JSON data and returns it back

3. Hello API:
   - GET `/api/hello/<name>`
   - Returns a greeting with the provided name

## Testing the API

You can test the API using curl or Postman:

```bash
# Test endpoint
curl http://localhost:5000/api/test

# Hello endpoint
curl http://localhost:5000/api/hello/John

# POST data endpoint
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' http://localhost:5000/api/data
``` 