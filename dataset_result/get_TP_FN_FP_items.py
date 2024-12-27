import json
import sys

if len(sys.argv) != 2:
    print("Usage: python get_CWE_FP.py <strategy_number>")
    sys.exit(1)

strategy_number = sys.argv[1]
strategy = f"strategy{strategy_number}/"
# strategy = "strategy1/"


# List of selected CWEs
selected_cwes = ['CWE-416', 'CWE-415', 'CWE-476', 'CWE-401', 'CWE-775', 
                 'CWE-762', 'CWE-789', 'CWE-773', 'CWE-590', 'CWE-190']

def add_cwe_prefix(cwes):
    return ['CWE-' + str(cwe).replace('CWE-', '') for cwe in cwes]

def find_examples(data, cwe, model_name):
    tp_example = None
    fn_example = None
    fp_example = None
    
    for item in data:
        actual_cwes = item['data']['cwe_ids']
        # Add CWE- prefix to predicted CWEs
        predicted_cwes = add_cwe_prefix(item['result']['CWEs'])
        
        # True Positive
        if cwe in actual_cwes and cwe in predicted_cwes and not tp_example:
            tp_example = {
                "data": {
                    "cwe_ids": actual_cwes,
                    "filename": item['data']['filename'],
                    "type": "TP",
                    "cwe": cwe,
                    "actual_cwes": actual_cwes,
                    "predicted_cwes": predicted_cwes
                },
                "language": item.get("language", "lang-cpp"),
                "code": item["code"],
                "result": {}
            }
        
        # False Negative
        if cwe in actual_cwes and cwe not in predicted_cwes and not fn_example:
            fn_example = {
                "data": {
                    "cwe_ids": actual_cwes,
                    "filename": item['data']['filename'],
                    "type": "FN",
                    "cwe": cwe,
                    "actual_cwes": actual_cwes,
                    "predicted_cwes": predicted_cwes
                },
                "language": item.get("language", "lang-cpp"),
                "code": item["code"],
                "result": {}
            }
        
        # False Positive
        if cwe in predicted_cwes and cwe not in actual_cwes and not fp_example:
            fp_example = {
                "data": {
                    "cwe_ids": actual_cwes,
                    "filename": item['data']['filename'],
                    "type": "FP",
                    "cwe": cwe,
                    "actual_cwes": actual_cwes,
                    "predicted_cwes": predicted_cwes
                },
                "language": item.get("language", "lang-cpp"),
                "code": item["code"],
                "result": {}
            }
            
    return [tp_example, fn_example, fp_example]

# Read the JSON files
with open(strategy + 'responseGemini.json', 'r') as f:
    gemini_data = json.load(f)
with open(strategy + 'responseGPT.json', 'r') as f:
    gpt_data = json.load(f)
with open(strategy + 'responseClaude.json', 'r') as f:
    claude_data = json.load(f)

# Process each model
models = {
    'gemini': gemini_data,
    'gpt': gpt_data,
    'claude': claude_data
}

for model_name, data in models.items():
    results = []
    for cwe in selected_cwes:
        examples = find_examples(data, cwe, model_name)
        results.extend([ex for ex in examples if ex is not None])
    
    # Save to file
    output_filename = f'results_{model_name}.json'
    with open(strategy + output_filename, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Created {output_filename}")

# Print a sample to verify the new structure
for model_name in models.keys():
    print(f"\
Sample from {model_name}:")
    with open(strategy + f'results_{model_name}.json', 'r') as f:
        results = json.load(f)
        if results:
            print(json.dumps(results[0], indent=2))