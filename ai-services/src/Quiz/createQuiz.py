import ollama
import json
import re
import time
from typing import Union, Dict, Any

class LlamaQuizGenerator:
    def __init__(self, question_count, difficulty, fiche_content, fiche_title, fiche_id):
        self.question_count = question_count
        self.difficulty = difficulty
        self.fiche_content = fiche_content
        self.fiche_title = fiche_title
        self.fiche_id = fiche_id

    def generate_prompt(self):
        return f"""You are an expert pedagogue specialized in creating high-quality Multiple Choice Questions (MCQs).

STRICT RULES FOR THE MCQs:
1. Each question must have EXACTLY 4 options
2. ONLY ONE correct answer per question (as a String)
3. The 3 incorrect answers must be plausible but wrong
4. Avoid negative or ambiguous phrasing
5. Vary the position of the correct answer
6. Explanations must be clear and educational
7. STRICTLY follow the required JSON format

STRATEGIES FOR GOOD DISTRACTORS:
- Use common student mistakes
- Include partially correct answers
- Use related but incorrect terms
- Avoid "All of the above" or "None of the above"

IMPORTANT: The output format must be compatible with the provided Mongoose model.

Based on the educational content, generate an MCQ quiz with {self.question_count} questions of {self.difficulty} difficulty level.

=== EDUCATIONAL CONTENT ===
title: {self.fiche_title}
content: {self.fiche_content}
===========================

PARAMETERS:
- Number of questions: {self.question_count}
- Difficulty: {self.difficulty}
- Exactly 4 options per question

MANDATORY JSON FORMAT (Mongoose-compatible):
{{
  "title": "MCQ - {self.fiche_title}",
  "fiche": "{self.fiche_id}",
  "questions": [
    {{
      "question": "A clear question ending with a question mark?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Exact correct option (String)",
      "explanation": "Detailed explanation of the correct answer",
      "difficulty": "{self.difficulty}",
      "points": 1
    }}
  ],
  "config": {{
    "timeLimit": 60,
    "passingScore": 70,
    "shuffleQuestions": true,
    "showCorrectAnswers": true,
    "allowRetries": true
  }}
}}

CRITICAL: Return ONLY the JSON object, nothing else. No explanatory text before or after.

Difficulty Instructions:
- EASY: Questions about definitions and basic concepts, simple vocabulary, one concept per question
- MEDIUM: Application and comprehension questions, combine 2-3 concepts, requires reflection  
- HARD: Advanced analysis and synthesis questions, complex scenarios, very plausible distractors"""

    def clean_json_response(self, response: Union[str, dict]) -> str:
        """
        Clean and validate JSON response from AI model.
        More conservative approach to avoid corrupting valid JSON.
        """
        # Handle non-string types first
        if isinstance(response, dict):
            return json.dumps(response)
        if not isinstance(response, str):
            response = str(response)
        
        print(f"📊 Original response length: {len(response)}")
        print(f"📋 First 200 chars: {response[:200]}")
        
        # Step 1: Remove markdown code block indicators
        response = re.sub(r"```(?:json)?\s*", "", response, flags=re.IGNORECASE)
        response = re.sub(r"```\s*$", "", response)
        
        # Step 2: Extract JSON content between first { and last }
        start_idx = response.find("{")
        if start_idx == -1:
            print("⚠️ WARNING: No opening brace found in response")
            return '{"error": "No JSON found", "questions": []}'
        
        end_idx = response.rfind("}")
        if end_idx == -1:
            print("⚠️ WARNING: No closing brace found in response")
            return '{"error": "Invalid JSON structure", "questions": []}'
        
        response = response[start_idx:end_idx + 1]
        print(f"✂️ After brace extraction: {response[:200]}")
        
        # Step 3: Remove comments (but be careful)
        response = re.sub(r'^\s*//.*$', '', response, flags=re.MULTILINE)
        response = re.sub(r'/\*.*?\*/', '', response, flags=re.DOTALL)
        
        # Step 4: Clean up basic formatting issues
        response = response.strip()
        response = re.sub(r',\s*([}\]])', r'\1', response)
        
        print(f"🧹 After initial cleaning: {response[:300]}")
        
        # Step 5: Try to parse - if it works, we're done!
        try:
            parsed = json.loads(response)
            print("✅ JSON is valid after initial cleaning")
            return response
        except json.JSONDecodeError as e:
            print(f"❌ JSON still invalid: {e}")
            print(f"🔍 Error around position {e.pos}: '{response[max(0, e.pos-20):e.pos+20]}'")
        
        # Step 6: More aggressive fixes only if needed
        return self.apply_targeted_fixes(response)

    def apply_targeted_fixes(self, response: str) -> str:
        """Apply specific fixes based on common JSON issues."""
        original = response
        
        # Fix 1: Handle unescaped quotes in string values
        try:
            response = self.fix_unescaped_quotes(response)
            json.loads(response)
            print("✅ Fixed with quote escaping")
            return response
        except json.JSONDecodeError:
            print("❌ Quote escaping didn't help")
        
        # Fix 2: Try structural repairs
        try:
            response = self.fix_json_structure(original)
            json.loads(response)
            print("✅ Fixed with structural repair")
            return response
        except json.JSONDecodeError:
            print("❌ Structural repair didn't help")
        
        # Fix 3: Last resort - extract what we can
        try:
            extracted = self.extract_partial_json(original)
            if extracted and extracted.get("questions"):
                print("✅ Partial extraction successful")
                return json.dumps(extracted)
        except Exception as e:
            print(f"❌ Partial extraction failed: {e}")
        
        # Complete failure
        print("🚨 All targeted fixes failed")
        return self.create_error_json("All JSON repair attempts failed")

    def fix_unescaped_quotes(self, text: str) -> str:
        """Fix unescaped quotes within JSON string values."""
        def escape_quotes_in_match(match):
            key_part = match.group(1)
            value_part = match.group(2)
            escaped_value = value_part.replace('\\"', '___TEMP___').replace('"', '\\"').replace('___TEMP___', '\\"')
            return f'{key_part}"{escaped_value}"'
        
        pattern = r'("[\w\s\-_]+"\s*:\s*")(.*?)("(?=\s*[,}\]]))'
        return re.sub(pattern, escape_quotes_in_match, text, flags=re.DOTALL)

    def fix_json_structure(self, text: str) -> str:
        """Fix common JSON structural issues."""
        text = re.sub(r'}\s*{', '}, {', text)
        text = re.sub(r']\s*\[', '], [', text)
        text = re.sub(r'\s*:\s*', ': ', text)
        text = re.sub(r'\s*,\s*', ', ', text)
        text = re.sub(r'(?<!["\w])(\w+)(?=\s*:)', r'"\1"', text)
        return text

    def extract_partial_json(self, text: str) -> Dict[str, Any]:
        """Last resort: try to extract a valid quiz structure from corrupted JSON."""
        result = {
            "title": "MCQ - Recovered Quiz",
            "fiche": "unknown",
            "questions": []
        }
        
        # Extract title
        title_match = re.search(r'"title"\s*:\s*"([^"]*)"', text)
        if title_match:
            result["title"] = title_match.group(1)
        
        # Extract fiche
        fiche_match = re.search(r'"fiche"\s*:\s*"([^"]*)"', text)
        if fiche_match:
            result["fiche"] = fiche_match.group(1)
        
        # Try to extract questions
        questions_section = re.search(r'"questions"\s*:\s*\[(.*)\]', text, re.DOTALL)
        if questions_section:
            questions_text = questions_section.group(1)
            question_matches = re.findall(r'{[^{}]*"question"[^{}]*}', questions_text)
            
            for q_match in question_matches:
                try:
                    question_obj = json.loads(q_match)
                    result["questions"].append(question_obj)
                except:
                    continue
        
        return result if result["questions"] else None

    def simple_json_cleaner(self, response: Union[str, dict]) -> str:
        """Simplified version that focuses on the most common issues."""
        if isinstance(response, dict):
            return json.dumps(response)
        if not isinstance(response, str):
            response = str(response)
        
        # Remove markdown
        response = re.sub(r"```(?:json)?\s*", "", response, flags=re.IGNORECASE)
        response = re.sub(r"```", "", response)
        
        # Extract JSON
        start = response.find("{")
        end = response.rfind("}")
        if start == -1 or end == -1:
            return '{"error": "No valid JSON structure found", "questions": []}'
        
        response = response[start:end + 1]
        response = re.sub(r',\s*([}\]])', r'\1', response)
        
        try:
            json.loads(response)
            return response
        except json.JSONDecodeError as e:
            print(f"❌ JSON error: {e}")
            return json.dumps({
                "error": "Invalid JSON from AI",
                "questions": [],
                "debug_info": str(e)
            })

    def validate_quiz_structure(self, quiz_data: dict) -> bool:
        """Validate that the quiz has the expected structure."""
        required_fields = ["title", "questions"]
        
        for field in required_fields:
            if field not in quiz_data:
                print(f"❌ Missing required field: {field}")
                return False
        
        if not isinstance(quiz_data["questions"], list):
            print("❌ Questions is not an array")
            return False
        
        if len(quiz_data["questions"]) == 0:
            print("❌ No questions found")
            return False
        
        for i, question in enumerate(quiz_data["questions"]):
            if not isinstance(question, dict):
                print(f"❌ Question {i} is not an object")
                return False
            
            required_q_fields = ["question", "options", "correctAnswer"]
            for field in required_q_fields:
                if field not in question:
                    print(f"❌ Question {i} missing field: {field}")
                    return False
            
            if not isinstance(question["options"], list) or len(question["options"]) < 2:
                print(f"❌ Question {i} has invalid options")
                return False
        
        print("✅ Quiz structure validation passed")
        return True

    def log_structure_issues(self, quiz_data):
        """Helper method to log what's wrong with the quiz structure for debugging."""
        issues = []
        
        if not isinstance(quiz_data, dict):
            issues.append("Root is not an object")
        
        if "title" not in quiz_data:
            issues.append("Missing 'title' field")
        
        if "questions" not in quiz_data:
            issues.append("Missing 'questions' field")
        elif not isinstance(quiz_data["questions"], list):
            issues.append("'questions' is not an array")
        elif len(quiz_data["questions"]) == 0:
            issues.append("'questions' array is empty")
        
        if issues:
            print(f"🔍 Structure issues found: {', '.join(issues)}")

    def create_error_json(self, error_message: str) -> str:
        """Create a valid error JSON response."""
        return json.dumps({
            "error": error_message,
            "title": "MCQ - Generation Failed",
            "fiche": "error",
            "questions": []
        })

    def create_fallback_quiz(self) -> str:
        """Create a minimal working quiz as ultimate fallback."""
        fallback = {
            "title": "MCQ - Sample Quiz (Generation Failed)",
            "fiche": "fallback",
            "questions": [
                {
                    "question": "This is a sample question because quiz generation failed. What should you do?",
                    "options": [
                        "Check the AI model connection",
                        "Review the prompt format", 
                        "Check server logs",
                        "All of the above"
                    ],
                    "correctAnswer": "All of the above",
                    "explanation": "When quiz generation fails, you should check all these potential issues."
                }
            ]
        }
        return json.dumps(fallback)

    def generate_quiz(self, max_retries=3):
        """
        Generate quiz with improved error handling and JSON cleaning.
        """
        prompt = self.generate_prompt()
        
        for attempt in range(max_retries):
            print(f"\nQuiz generation attempt {attempt + 1}/{max_retries}")
            
            try:
                # Add a small delay between retries to avoid overwhelming the API
                if attempt > 0:
                    print("Waiting 2 seconds before retry...")
                    time.sleep(2)
                
                result = ollama.chat(
                    model="llama3.1:latest",
                    messages=[{"role": "user", "content": prompt}],
                    options={
                        "temperature": 0.1,
                        "top_p": 0.8,
                        "repeat_penalty": 1.1,
                        "num_predict": 2000
                    }
                )
                
                raw_response = result["message"]["content"]
                print(f"Raw response from Ollama (first 200 chars): {raw_response[:200]}")
                
                # Check if response is suspiciously short (might indicate API issue)
                if len(raw_response.strip()) < 50:
                    print(f"⚠️  Response too short ({len(raw_response)} chars), skipping")
                    continue
                
                # Try the improved cleaning function
                cleaned_response = self.clean_json_response(raw_response)
                
                # Validate the cleaned response
                try:
                    parsed_json = json.loads(cleaned_response)
                    
                    # Additional validation - ensure it has the expected structure
                    if self.validate_quiz_structure(parsed_json):
                        print("✅ Valid quiz JSON obtained, returning")
                        return cleaned_response
                    else:
                        print("❌ JSON valid but quiz structure invalid")
                        # Log what was wrong for debugging
                        self.log_structure_issues(parsed_json)
                        continue
                        
                except json.JSONDecodeError as e:
                    print(f"❌ Attempt {attempt+1} failed to parse JSON: {e}")
                    
                    # If the improved cleaner fails, try the simple backup
                    if attempt == max_retries - 1:  # Last attempt
                        print("Trying simple backup cleaner...")
                        backup_response = self.simple_json_cleaner(raw_response)
                        try:
                            parsed_backup = json.loads(backup_response)
                            if self.validate_quiz_structure(parsed_backup):
                                print("✅ Backup cleaner succeeded")
                                return backup_response
                            else:
                                print("❌ Backup cleaner produced invalid structure")
                        except json.JSONDecodeError as backup_error:
                            print(f"❌ Backup cleaner also failed: {backup_error}")
                    
            except Exception as e:
                print(f"❌ Ollama API call failed on attempt {attempt+1}: {e}")
                if attempt < max_retries - 1:
                    print("Retrying...")
                    continue
        
        # If all retries fail, return a minimal structure
        print("🚨 All attempts failed, returning fallback quiz")
        return self.create_fallback_quiz()