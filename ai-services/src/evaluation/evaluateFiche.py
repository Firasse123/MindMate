import ollama 
import json
import re


class LLamaEvaluateFiche:
    def __init__(self, fiche_content):
        self.fiche_content = fiche_content
        

    def clean_json_response(self, response) -> str:
        """Clean the model response to extract valid JSON."""
        
        # Handle non-string types first
        if isinstance(response, dict):
            return json.dumps(response)
        if not isinstance(response, str):
            response = str(response)

        # Remove markdown code block indicators like ```json or ```
        response = re.sub(r"```json\s*", "", response, flags=re.IGNORECASE)
        response = re.sub(r"```", "", response)

        # Remove any text before the first {
        start_idx = response.find("{")
        if start_idx != -1:
            response = response[start_idx:]

        # Remove any text after the last }
        end_idx = response.rfind("}")
        if end_idx != -1:
            response = response[:end_idx + 1]

        # CRITICAL: Remove JSON comments (// style comments)
        # Remove single-line comments
        response = re.sub(r'//.*?(?=\n|$)', '', response)
        # Remove multi-line comments
        response = re.sub(r'/\*.*?\*/', '', response, flags=re.DOTALL)

        # Clean up common formatting issues
        response = response.strip()

        # Remove trailing commas before closing braces/brackets
        response = re.sub(r',\s*}', '}', response)
        response = re.sub(r',\s*]', ']', response)
        
        # Fix common JSON issues
        # Replace single quotes with double quotes (but be careful with apostrophes)
        response = re.sub(r"(?<!\w)'(\w)", r'"\1', response)  # 'word -> "word
        response = re.sub(r"(\w)'(?!\w)", r'\1"', response)   # word' -> word"
        
        return response

    def validate_response_structure(self, parsed_json):
        """Validate that the parsed JSON has the expected structure."""
        required_keys = ["title", "classification", "qualityScore"]
        
        for key in required_keys:
            if key not in parsed_json:
                return False, f"Missing required key: {key}"
        
        # Validate classification structure
        classification = parsed_json.get("classification", {})
        classification_keys = ["domain", "difficulty", "topics", "estimatedStudyTime"]
        for key in classification_keys:
            if key not in classification:
                return False, f"Missing classification key: {key}"
        
        # Validate qualityScore structure
        quality_score = parsed_json.get("qualityScore", {})
        quality_keys = ["score", "criteria", "feedback"]
        for key in quality_keys:
            if key not in quality_score:
                return False, f"Missing qualityScore key: {key}"
        
        # Validate criteria structure
        criteria = quality_score.get("criteria", {})
        criteria_keys = ["clarity", "coherence", "completeness", "structure"]
        for key in criteria_keys:
            if key not in criteria:
                return False, f"Missing criteria key: {key}"
        
        return True, "Valid structure"

    def generate_evaluation_prompt(self):
        return f"""You are an expert educational content evaluator with expertise across multiple academic domains. Your task is to comprehensively assess a study fiche (learning card), generate appropriate metadata, provide detailed quality feedback.

FICHE CONTENT TO EVALUATE:
{self.fiche_content}

EVALUATION TASK:
1. Generate appropriate title, domain classification, difficulty level, and topic keywords for this content
2. Analyze the fiche quality across multiple dimensions 
3. Provide both quantitative scores and qualitative feedback

CLASSIFICATION REQUIREMENTS:

TITLE GENERATION:
- Create a clear, descriptive title (max 200 characters)
- Should accurately reflect the main subject matter
- Use academic but accessible language

DOMAIN CLASSIFICATION (select one):
Choose from: mathematics, physics, chemistry, biology, history, geography, literature, philosophy, computer_science, economics, law, medicine, psychology, sociology, art, music, other

DIFFICULTY ASSESSMENT:
- "easy": Basic concepts, simple language, introductory level
- "medium": Moderate complexity, some technical terms, intermediate understanding required  
- "hard": Advanced concepts, specialized terminology, expert-level knowledge needed

TOPIC KEYWORDS:
- Extract 3-5 specific keywords that represent main subjects covered
- Use precise, searchable terms
- Prioritize concepts that students would search for

SCORING CRITERIA (0-25 points each, total 100):

1. CLARITY (0-25 points)
   - Language appropriateness for target difficulty level
   - Clear definitions and explanations
   - Logical flow of information
   - Absence of ambiguity or confusion

2. COHERENCE (0-25 points)  
   - Internal consistency of content
   - Logical connections between concepts
   - Unified theme and focus
   - Smooth transitions between sections

3. COMPLETENESS (0-25 points)
   - Coverage of essential concepts for the topic
   - Adequate depth for declared difficulty level
   - Inclusion of relevant examples
   - Balance between breadth and depth

4. STRUCTURE (0-25 points)
   - Effective use of headers and organization
   - Proper formatting and readability
   - Logical sequence of information
   - Clear section divisions

   
SCORING GUIDELINES:
- Content with no educational substance should score below 30
- Single sentences or minimal content cannot exceed 40 points
- Medium scores (50-70) should be reserved for content with clear educational value but some deficiencies


CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON
- Do NOT use markdown code blocks
- Do NOT add any explanatory text before or after the JSON
- Do NOT include comments in the JSON (no // or /* */ comments)
- Use double quotes only, never single quotes
- Ensure all string values are properly escaped
- Keep feedback text concise and avoid line breaks within strings
- Numbers should be bare integers/floats, not strings

RESPONSE FORMAT (must match exactly):
{{"title": "Generated title here", "classification": {{"domain": "selected_domain", "difficulty": "assessed_difficulty", "topics": ["topic1", "topic2", "topic3"], "estimatedStudyTime": 25}}, "qualityScore": {{"score": 85, "criteria": {{"clarity": 22, "coherence": 21, "completeness": 20, "structure": 22}}, "feedback": "Detailed feedback explaining strengths, weaknesses, and improvements made}}}}


SPECIAL INSTRUCTIONS FOR MINIMAL CONTENT:
- If content is extremely brief or vague, still provide a complete evaluation
- For unclear domain, use "other"
- For minimal content, focus feedback on what's missing
- Always generate valid JSON regardless of content quality

"""

    def create_fallback_response(self, error_message):
        """Create a fallback response when parsing fails"""
        return {
            "title": "Evaluation Failed",
            "classification": {
                "domain": "other",
                "difficulty": "medium",
                "topics": ["evaluation_error"],
                "estimatedStudyTime": 0
            },
            "qualityScore": {
                "score": 0,
                "criteria": {
                    "clarity": 0,
                    "coherence": 0,
                    "completeness": 0,
                    "structure": 0
                },
                "feedback": f"Evaluation failed due to: {error_message}"
            }
        }

    def evaluateFiche(self, max_retries=3):
        """Evaluate the fiche with robust error handling and JSON parsing"""
        prompt = self.generate_evaluation_prompt()
        
        for attempt in range(max_retries):
            try:
                # Get response from Ollama
                result = ollama.chat(
                    model="llama3.1:latest",
                    messages=[{"role": "user", "content": prompt}],
                    options={
                        "temperature": 0.1,  # Even lower for more consistent JSON
                        "top_p": 0.8,
                        "repeat_penalty": 1.1,
                        "num_predict": 2000  # Limit response length
                    }
                )
                
                raw_response = result["message"]["content"]
                print(f"Raw response (attempt {attempt + 1}): {raw_response[:200]}...")
                
                # Clean the response
                cleaned_response = self.clean_json_response(raw_response)
                print(f"Cleaned response: {cleaned_response[:200]}...")
                
                # Try to parse JSON
                parsed_json = json.loads(cleaned_response)
                
                # Validate structure
                is_valid, validation_message = self.validate_response_structure(parsed_json)
                if not is_valid:
                    print(f"Structure validation failed: {validation_message}")
                    if attempt == max_retries - 1:
                        return self.create_fallback_response(f"Invalid structure: {validation_message}")
                    continue
                
                print("Successfully parsed and validated JSON response")
                return parsed_json
                        
            except json.JSONDecodeError as e:
                print(f"JSON decode error on attempt {attempt + 1}: {e}")
                print(f"Problematic JSON: {cleaned_response}")
                if attempt == max_retries - 1:
                    return self.create_fallback_response(f"JSON parsing failed: {e}")
                    
            except Exception as e:
                print(f"Unexpected error on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    return self.create_fallback_response(f"Unexpected error: {e}")
        
        return self.create_fallback_response("Max retries exceeded")