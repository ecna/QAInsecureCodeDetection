# Inspect the structure of the JSON file
import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys

if len(sys.argv) != 2:
    print("Usage: python get_TP_FN.py <strategy_number>")
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

    actual_cwes = []
    detected_cwes = []

    for entry in data:
        actual_cwes.extend(entry['data']['cwe_ids'])
        detected_cwes.extend(entry['result']['CWEs'])

    all_cwes = set(actual_cwes + detected_cwes)

    comparison_data = []

    for entry in data:
        actual_cwes = entry['data']['cwe_ids']
        detected_cwes = entry['result']['CWEs']

        for cwe in actual_cwes:
            cwe_num = cwe.replace('CWE-', '') if isinstance(cwe, str) else str(cwe)
            detected_count = detected_cwes.count(int(cwe_num)) if cwe_num.isdigit() else 0

            comparison_data.append({
                'CWE': cwe,
                'Present': 1,
                'Detected': detected_count
            })

    df = pd.DataFrame(comparison_data)
    df = df.groupby('CWE').sum().reset_index()

    plt.figure(figsize=(10, 6))
    x = range(len(df['CWE']))
    width = 0.35

    plt.bar([i - width/2 for i in x], df['Present'], width, label='Present in Code', color='blue', alpha=0.7)
    plt.bar([i + width/2 for i in x], df['Detected'], width, label='Detected by AI', color='red', alpha=0.7)

    plt.xlabel('CWE IDs')
    plt.ylabel('Count')
    plt.title(f'Comparison of Present vs Detected CWEs\n(Only for CWEs present in code) - {json_file}')
    plt.xticks(x, df['CWE'], rotation=45)
    plt.legend()
    plt.tight_layout()

    output_filename = os.path.splitext(json_file)[0] + "_TP_FN.png"
    plt.savefig(strategy + "/graphs/" + output_filename)
    plt.close()

    print(f"\nDetailed comparison for CWEs present in code for {json_file}:")
    print(df)

# Process each JSON file
for json_file in json_files:
    process_json_file(json_file)
