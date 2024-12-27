import json

# Selected CWEs
selected_cwes = [416, 415, 476, 401, 775, 762, 789, 773, 590, 190]

# Sample data structure
data = {
    "gemini": [],
    "GPT": [],
    "Claude": []
}

# Function to process data and extract TP, FN, FP for each CWE
def process_data(strategy_data, model_name):
    results = {cwe: {"true_positive": None, "false_negative": None, "false_positive": None} for cwe in selected_cwes}
    
    for item in strategy_data:
        cwe_ids = item['data']['cwe_ids']
        detected_cwes = item['result']['CWEs']
        
        for cwe in selected_cwes:
            if cwe in cwe_ids and cwe in detected_cwes and results[cwe]["true_positive"] is None:
                results[cwe]["true_positive"] = item
            if cwe in cwe_ids and cwe not in detected_cwes and results[cwe]["false_negative"] is None:
                results[cwe]["false_negative"] = item
            if cwe in detected_cwes and cwe not in cwe_ids and results[cwe]["false_positive"] is None:
                results[cwe]["false_positive"] = item
    
    data[model_name] = results

# Sample strategy data for each model
strategy_3_gemini = []
strategy_3_gpt = []
strategy_3_claude = []

# Read data from JSON files
with open('strategy3/responseClaude.json', 'r') as f:
    strategy_3_claude = json.load(f)

with open('strategy3/responseGemini.json', 'r') as f:
    strategy_3_gemini = json.load(f)

with open('strategy3/responseGPT.json', 'r') as f:
    strategy_3_gpt = json.load(f)

# Process data for each model
process_data(strategy_3_gemini, "gemini")
process_data(strategy_3_gpt, "GPT")
process_data(strategy_3_claude, "Claude")

# Save results to JSON files
with open('strategy3/gemini_results.json', 'w') as f:
    json.dump(data["gemini"], f, indent=4)

with open('strategy3/gpt_results.json', 'w') as f:
    json.dump(data["GPT"], f, indent=4)

with open('strategy3/claude_results.json', 'w') as f:
    json.dump(data["Claude"], f, indent=4)
import json

