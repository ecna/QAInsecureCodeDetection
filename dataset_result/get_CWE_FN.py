# List of JSON files to process
import json
import os
from matplotlib import pyplot as plt
import sys

if len(sys.argv) != 2:
    print("Usage: python get_CWE_FN.py <strategy_number>")
    sys.exit(1)

strategy_number = sys.argv[1]
strategy = f"strategy{strategy_number}/"
# strategy = "strategy1/"

json_files = ['responseClaude.json', 'responseGPT.json', 'responseGemini.json']

# Create a directory for graphs if it doesn't exist
os.makedirs(strategy + 'graphs', exist_ok=True)

# Function to analyze false negatives for a specific CWE in the "data" field
def analyze_false_negatives_per_cwe(target_cwe):
    incorrect_detections = {}

    for entry in data:
        # Check if this entry should contain our target CWE
        actual_cwes = [str(cwe).replace('CWE-', '') for cwe in entry['data']['cwe_ids']]
        if str(target_cwe).replace('CWE-', '') in actual_cwes:
            # Get the detected CWEs for this entry
            detected_cwes = [str(cwe) for cwe in entry['result']['CWEs']]
            # If our target CWE wasn't detected, record what was detected instead
            if str(target_cwe).replace('CWE-', '') not in detected_cwes:
                for detected in detected_cwes:
                    incorrect_detections[f'CWE-{detected}'] = incorrect_detections.get(f'CWE-{detected}', 0) + 1

    return incorrect_detections

# List of CWEs we're interested in
target_cwes = ['CWE-476', 'CWE-773', 'CWE-416', 'CWE-190', 'CWE-762', 
               'CWE-590', 'CWE-789', 'CWE-401', 'CWE-415', 'CWE-775']

for json_file in json_files:
    # Load the JSON file
    with open(strategy + json_file, 'r') as file:
        data = json.load(file)

    # Create subplots for each CWE
    fig = plt.figure(figsize=(20, 15))
    # fig.suptitle(f'False Negatives Analysis for {json_file}', fontsize=16, y=0.95)

    for idx, cwe in enumerate(target_cwes, 1):
        incorrect_detections = analyze_false_negatives_per_cwe(cwe)

        # Sort and get top 10 incorrect detections for readability
        sorted_detections = dict(sorted(incorrect_detections.items(), key=lambda x: x[1], reverse=True)[:10])

        # Add "Others" category if there are more
        if len(incorrect_detections) > 10:
            others_sum = sum(list(incorrect_detections.values())[10:])
            if others_sum > 0:
                sorted_detections['Others'] = others_sum

        # Create subplot
        plt.subplot(3, 4, idx)

        if sorted_detections:  # Only create pie if there are false negatives
            plt.pie(sorted_detections.values(), labels=sorted_detections.keys(), autopct='%1.1f%%')
            plt.title(f'{cwe}\nTotal False Negatives: {sum(incorrect_detections.values())}')
        else:
            plt.text(0.5, 0.5, 'No False Negatives', horizontalalignment='center', verticalalignment='center')
            plt.title(cwe)

    plt.tight_layout()
    plt.savefig(strategy + f'graphs/{os.path.splitext(json_file)[0]}_CWE_FN.png')
    plt.close()

    # Print detailed statistics for each CWE
    for cwe in target_cwes:
        incorrect_detections = analyze_false_negatives_per_cwe(cwe)
        if incorrect_detections:
            print(f"\nDetailed statistics for {cwe} in {json_file}:")
            total = sum(incorrect_detections.values())
            sorted_items = sorted(incorrect_detections.items(), key=lambda x: x[1], reverse=True)
            for detected_cwe, count in sorted_items[:10]:  # Show top 10
                print(f"{detected_cwe}: {count} times ({(count/total)*100:.1f}%)")
            if len(sorted_items) > 10:
                others_sum = sum(count for _, count in sorted_items[10:])
                print(f"Others: {others_sum} times ({(others_sum/total)*100:.1f}%)")
        else:
            print(f"\n{cwe} in {json_file}: No false negatives found")
