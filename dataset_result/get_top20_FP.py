
# Inspect the structure of the JSON file
import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys

if len(sys.argv) != 2:
    print("Usage: python get_top20_FP.py <strategy_number>")
    sys.exit(1)

strategy_number = sys.argv[1]
strategy = f"strategy{strategy_number}/"
# strategy = "strategy1/"

# List of JSON files to process
json_files = ['responseGPT.json', 'responseGemini.json', 'responseClaude.json']

# Function to process each JSON file
def process_json_file(json_file):
    with open(strategy + json_file, 'r') as file:
        data = json.load(file)


    # Collect all detected CWEs and actual CWEs
    false_positives = {}

    for entry in data:
        actual_cwes = set(str(cwe).replace('CWE-', '') for cwe in entry['data']['cwe_ids'])
        detected_cwes = set(str(cwe) for cwe in entry['result']['CWEs'])
        
        # For each detected CWE that's not in actual_cwes, count it as a false positive
        for detected_cwe in detected_cwes:
            if detected_cwe not in actual_cwes:
                false_positives[detected_cwe] = false_positives.get(detected_cwe, 0) + 1

    # Convert to DataFrame
    df_false_positives = pd.DataFrame([
        {'CWE': f'CWE-{cwe}', 'False_Positives': count} 
        for cwe, count in false_positives.items()
    ]).sort_values('False_Positives', ascending=False)

    # Plot top 20 false positives for better visibility
    top_20_fp = df_false_positives.head(20)

    plt.figure(figsize=(15, 8))
    bars = plt.bar(range(len(top_20_fp)), top_20_fp['False_Positives'], color='red', alpha=0.7)
    plt.xlabel('CWE IDs')
    plt.ylabel('Number of False Positive Detections')
    plt.title('Top 20 False Positive CWE Detections\
    (CWEs detected but not part of testcase)')
    plt.xticks(range(len(top_20_fp)), top_20_fp['CWE'], rotation=45, ha='right')
    plt.tight_layout()

    # Add value labels on top of each bar
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom')

    output_filename = os.path.splitext(json_file)[0] + "_top20_FP.png"
    plt.savefig(strategy + "/graphs/" + output_filename)
    plt.close()

    print("\
    Full list of false positive detections:")
    print(df_false_positives)

# Process each JSON file
for json_file in json_files:
    process_json_file(json_file)
