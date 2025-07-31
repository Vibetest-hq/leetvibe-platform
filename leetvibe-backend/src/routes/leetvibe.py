import os
from openai import AzureOpenAI
from flask import Blueprint, request, jsonify
import subprocess
import tempfile
import json

leetvibe_bp = Blueprint('leetvibe', __name__)

# Azure OpenAI configuration
AZURE_OPENAI_ENDPOINT = "https://myopenairesourceforaia.openai.azure.com/"
AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
AZURE_DEPLOYMENT_NAME = "gpt-4o"

# Sample questions (no Two Sum!)
QUESTIONS = [
    {
        "id": "rest-api-sum",
        "title": "REST API Sum Calculator",
        "description": "Create a REST API endpoint that accepts two numbers and returns their sum.",
        "difficulty": "Easy",
        "category": "API Development",
        "starter_code": """from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/sum', methods=['POST'])
def calculate_sum():
    # Your code here
    pass

if __name__ == '__main__':
    app.run(debug=True)""",
        "test_cases": [
            {"input": {"a": 5, "b": 3}, "expected": 8},
            {"input": {"a": -1, "b": 1}, "expected": 0},
            {"input": {"a": 100, "b": 200}, "expected": 300}
        ]
    },
    {
        "id": "user-auth-api",
        "title": "User Authentication API",
        "description": "Build a simple user authentication system with registration and login endpoints.",
        "difficulty": "Medium",
        "category": "Authentication",
        "starter_code": """from flask import Flask, request, jsonify
import hashlib
import json

app = Flask(__name__)
users_db = {}

@app.route('/api/register', methods=['POST'])
def register():
    # Your code here
    pass

@app.route('/api/login', methods=['POST'])
def login():
    # Your code here
    pass

if __name__ == '__main__':
    app.run(debug=True)""",
        "test_cases": [
            {"input": {"username": "testuser", "password": "password123"}, "expected": "success"},
            {"input": {"username": "admin", "password": "admin123"}, "expected": "success"}
        ]
    },
    {
        "id": "data-processing",
        "title": "Data Processing Pipeline",
        "description": "Create a data processing function that filters and transforms a list of user records.",
        "difficulty": "Medium",
        "category": "Data Processing",
        "starter_code": """def process_user_data(users):
    \"\"\"
    Process a list of user dictionaries:
    - Filter out users under 18
    - Add a 'status' field based on age
    - Sort by age descending
    \"\"\"
    # Your code here
    pass

# Test data
users = [
    {"name": "Alice", "age": 25, "email": "alice@example.com"},
    {"name": "Bob", "age": 17, "email": "bob@example.com"},
    {"name": "Charlie", "age": 30, "email": "charlie@example.com"}
]""",
        "test_cases": [
            {"input": [{"name": "Alice", "age": 25}], "expected": [{"name": "Alice", "age": 25, "status": "adult"}]},
            {"input": [{"name": "Bob", "age": 17}], "expected": []},
            {"input": [{"name": "Charlie", "age": 30}], "expected": [{"name": "Charlie", "age": 30, "status": "adult"}]}
        ]
    }
]

@leetvibe_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "leetvibe-backend"})

@leetvibe_bp.route('/questions', methods=['GET'])
def get_questions():
    return jsonify(QUESTIONS)

@leetvibe_bp.route('/questions/<question_id>', methods=['GET'])
def get_question(question_id):
    question = next((q for q in QUESTIONS if q['id'] == question_id), None)
    if question:
        return jsonify(question)
    return jsonify({"error": "Question not found"}), 404

@leetvibe_bp.route('/execute-code', methods=['POST'])
def execute_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if language != 'python':
            return jsonify({"error": "Only Python is supported currently"}), 400
        
        # Create a temporary file to execute the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute the code with a timeout
            result = subprocess.run(
                ['python3', temp_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            output = result.stdout
            error = result.stderr
            
            return jsonify({
                "output": output,
                "error": error,
                "success": result.returncode == 0
            })
        
        finally:
            # Clean up the temporary file
            os.unlink(temp_file)
            
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Code execution timed out"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leetvibe_bp.route('/run-tests', methods=['POST'])
def run_tests():
    try:
        data = request.get_json()
        code = data.get('code', '')
        question_id = data.get('question_id', '')
        
        question = next((q for q in QUESTIONS if q['id'] == question_id), None)
        if not question:
            return jsonify({"error": "Question not found"}), 404
        
        test_results = []
        
        for i, test_case in enumerate(question['test_cases']):
            # Create test code
            test_code = f"""
{code}

# Test case {i + 1}
try:
    result = calculate_sum({test_case['input']['a']}, {test_case['input']['b']}) if 'calculate_sum' in locals() else None
    if result is None:
        result = process_user_data({test_case['input']}) if 'process_user_data' in locals() else None
    print(f"RESULT: {{result}}")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
            
            # Execute test
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(test_code)
                temp_file = f.name
            
            try:
                result = subprocess.run(
                    ['python3', temp_file],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                output = result.stdout.strip()
                passed = str(test_case['expected']) in output
                
                test_results.append({
                    "test_case": i + 1,
                    "input": test_case['input'],
                    "expected": test_case['expected'],
                    "passed": passed,
                    "output": output
                })
                
            finally:
                os.unlink(temp_file)
        
        passed_count = sum(1 for test in test_results if test['passed'])
        total_count = len(test_results)
        
        return jsonify({
            "results": test_results,
            "summary": {
                "passed": passed_count,
                "total": total_count,
                "success_rate": f"{passed_count}/{total_count}"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leetvibe_bp.route('/ai-assist', methods=['POST'])
def ai_assist():
    try:
        if not AZURE_OPENAI_API_KEY:
            return jsonify({"error": "Azure OpenAI API key not configured"}), 500
        
        data = request.get_json()
        prompt = data.get('prompt', '')
        code = data.get('code', '')
        
        client = AzureOpenAI(
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION
        )
        
        system_message = """You are a helpful coding assistant. Provide clear, concise help with coding problems. 
        Focus on explaining concepts and providing practical solutions."""
        
        user_message = f"Code context:\n{code}\n\nQuestion: {prompt}"
        
        response = client.chat.completions.create(
            model=AZURE_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return jsonify({
            "response": response.choices[0].message.content,
            "success": True
        })
        
    except Exception as e:
        return jsonify({
            "error": f"AI assistance failed: {str(e)}",
            "success": False
        }), 500

