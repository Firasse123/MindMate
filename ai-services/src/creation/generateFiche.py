import ollama 
import json
import re

class LlamaFicheGenerator:
    def __init__(self, domain, difficulty, text):
        self.domain = domain
        self.difficulty = difficulty
        self.text=text



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


    
  

    def get_domain_instruction(self):

        return """
"mathematics": "Include formulas, step-by-step solutions, and mathematical notation. Provide worked examples and common mistakes to avoid.",
"physics": "Include physical laws, formulas, units, and real-world applications. Explain concepts with analogies and practical examples.",
"chemistry": "Include chemical equations, molecular structures, reaction mechanisms, and laboratory applications.",
"biology": "Include biological processes, diagrams descriptions, classification systems, and physiological functions.",
"history": "Include dates, key figures, cause-and-effect relationships, and historical context.",
"geography": "Include locations, geographical features, climate patterns, and human-environment interactions.",
"literature": "Include literary devices, themes, character analysis, and historical context.",
"philosophy": "Include key arguments, logical reasoning, different perspectives, and critical thinking approaches.",
"computer_science": "Include algorithms, code examples, technical concepts, and practical implementations.",
"economics": "Include economic theories, graphs, real-world applications, and current examples.",
"law": "Include legal principles, case studies, statutory references, and practical applications.",
"medicine": "Include anatomical references, physiological processes, symptoms, and clinical applications.",
"psychology": "Include psychological theories, research findings, practical applications, and case studies.",
"sociology": "Include social theories, research methods, cultural contexts, and contemporary examples.",
"art": "Include artistic techniques, historical periods, cultural significance, and visual analysis.",
"music": "Include musical theory, historical context, technical aspects, and listening examples.",
"other": "Provide clear explanations, practical examples, and structured learning content."
"""

    def get_difficulty_instruction(self):
        return """
"easy": "Use simple language, basic concepts, and plenty of examples. Focus on fundamental understanding.",
"medium": "Use standard academic language, intermediate concepts, and balanced theory-practice approach.",
"hard": "Use advanced terminology, complex concepts, and detailed analysis. Include challenging examples."
"""

    def generate_prompt(self):
        domain_instructions = self.get_domain_instruction()
        difficulty_instructions = self.get_difficulty_instruction()
        return f"""
You are an expert educational content creator. Create a comprehensive study fiche based on the user's request. 
You MUST respond with a valid JSON object only, no additional text before or after.

text used to genrate the fiche is {self.text}
DOMAIN: {self.domain}
DIFFICULTY: {self.difficulty} 
DOMAIN GUIDELINES: {domain_instructions}
DIFFICULTY GUIDELINES: {difficulty_instructions}

Requirements:
- Create educational content appropriate for {self.difficulty} level
- Focus specifically on {self.domain} subject matter
- Include practical examples and clear explanations
- Structure content with headers, bullet points, and sections
- Extract 3-5 relevant topic keywords
- Estimate study time in minutes (5-120 minutes based on content length and difficulty)

RESPOND WITH ONLY THIS JSON FORMAT:
{{
  "title": "Clear, descriptive title (max 200 characters)",
  "content": "Generate a well-structured educational study sheet with Markdown headings, bullet points, bold text, emojis, and code/formulas where applicable. with:\\n# Main Title\\n\\n## Key Concepts\\n- Concept 1: explanation\\n- Concept 2: explanation\\n\\n## Detailed Explanation\\nDetailed content here...\\n\\n## Examples\\n- Example 1\\n- Example 2\\n\\n## Summary\\nKey takeaways... key words in bold",
  "classification": {{
    "domain": "{self.domain}",
    "difficulty": "{self.difficulty}",
    "topics": ["topic1", "topic2", "topic3"],
    "estimatedStudyTime": 25
  }}
}}
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

    def generate_fiche(self, max_retries=3):
        """Evaluate the fiche with robust error handling and JSON parsing"""
        prompt = self.generate_prompt()
        
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
    
    