from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Test route
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        "message": "API is working!",
        "status": "success"
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000) 