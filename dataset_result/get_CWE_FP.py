# Inspect the structure of the JSON file
import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys

if len(sys.argv) != 2:
    print("Usage: python get_CWE_FP.py <strategy_number>")
    sys.exit(1)

strategy_number = sys.argv[1]
strategy = f"strategy{strategy_number}/"
# strategy = "strategy1/"

# List of JSON files to process
json_files = ['responseGPT.json', 'responseGemini.json', 'responseClaude.json']

# Create a directory for graphs if it doesn't exist
os.makedirs(strategy + 'graphs', exist_ok=True)

# Function to process each JSON file
def process_json_file(json_file):
    with open(strategy + json_file, 'r') as file:
        data = json.load(file)
    # Extract actual CWEs and detected CWEs from the JSON structure
    actual_cwes = []
    detected_cwes = []

    for entry in data:
        actual_cwes.extend(entry['data']['cwe_ids'])
        detected_cwes.extend(entry['result']['CWEs'])
    # First get the set of CWEs that are actually present in the data field
    actual_cwes = set()
    for entry in data:
        actual_cwes.update(str(cwe).replace('CWE-', '') for cwe in entry['data']['cwe_ids'])

    # Now count false positives only for these CWEs
    false_positives = {cwe: 0 for cwe in actual_cwes}

    for entry in data:
        entry_actual_cwes = set(str(cwe).replace('CWE-', '') for cwe in entry['data']['cwe_ids'])
        entry_detected_cwes = set(str(cwe) for cwe in entry['result']['CWEs'])
        
        # For each detected CWE that's in our list of interest but not in this entry's actual CWEs
        for detected_cwe in entry_detected_cwes:
            if detected_cwe in actual_cwes and detected_cwe not in entry_actual_cwes:
                false_positives[detected_cwe] += 1

    # Convert to DataFrame
    df_false_positives = pd.DataFrame([
        {'CWE': f'CWE-{cwe}', 'False_Positives': count} 
        for cwe, count in false_positives.items()
    ]).sort_values('False_Positives', ascending=False)

    plt.figure(figsize=(12, 6))
    bars = plt.bar(range(len(df_false_positives)), df_false_positives['False_Positives'], color='red', alpha=0.7)
    plt.xlabel('CWE IDs')
    plt.ylabel('Number of False Positive Detections')
    plt.title('False Positive Detections for CWEs Present in Data\n(Times detected when not part of testcase)')
    plt.xticks(range(len(df_false_positives)), df_false_positives['CWE'], rotation=45, ha='right')

    # Add value labels on top of each bar
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom')

    plt.tight_layout()
    
    output_filename = os.path.splitext(json_file)[0] + "_CWE_FP.png"
    plt.savefig(strategy + "/graphs/" + output_filename)
    plt.close()

    print("\nFalse positive detections for CWEs present in data:")
    print(df_false_positives)

# Process each JSON file
for json_file in json_files:
    process_json_file(json_file)
