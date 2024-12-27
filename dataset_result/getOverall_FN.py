import json
import os

from matplotlib import pyplot as plt
import sys

if len(sys.argv) != 2:
    print("Usage: python getOverall_FN.py <strategy_number>")
    sys.exit(1)

strategy_number = sys.argv[1]
strategy = f"strategy{strategy_number}/"
# strategy = "strategy1/"

json_files = ['responseGemini.json', 'responseGPT.json', 'responseClaude.json']

# Create a directory for graphs if it doesn't exist
os.makedirs(strategy + 'graphs', exist_ok=True)

def analyze_false_negatives_all_cwes(data):
    # Dictionary to store all incorrect detections
    all_incorrect_detections = {}
    
    # Go through each entry
    for entry in data:
        # Get actual CWEs
        actual_cwes = set(str(cwe).replace('CWE-', '') for cwe in entry['data']['cwe_ids'])
        # Get detected CWEs
        detected_cwes = set(str(cwe) for cwe in entry['result']['CWEs'])
        
        # For each actual CWE that wasn't detected
        for actual_cwe in actual_cwes:
            if actual_cwe not in detected_cwes:
                # Count what was detected instead
                for detected in detected_cwes:
                    key = f'CWE-{detected}'
                    if key not in all_incorrect_detections:
                        all_incorrect_detections[key] = 0
                    all_incorrect_detections[key] += 1
    
    return all_incorrect_detections

for json_file in json_files:
    # Load the JSON file
    with open(strategy + json_file, 'r') as file:
        data = json.load(file)
    
    # Get all incorrect detections
    incorrect_detections = analyze_false_negatives_all_cwes(data)
    
    # Sort by frequency and get top 15 for visualization
    top_15_detections = dict(sorted(incorrect_detections.items(), key=lambda x: x[1], reverse=True)[:15])
    
    # Calculate total for percentage
    total_incorrect = sum(incorrect_detections.values())
    
    # Create pie chart
    plt.figure(figsize=(15, 10))
    plt.pie(top_15_detections.values(), 
            labels=[f'{k} ({v} times, {(v/total_incorrect)*100:.1f}%)' for k, v in top_15_detections.items()],
            autopct='%1.1f%%')
    plt.title(f'Top 15 Most Frequently Detected CWEs in False Negative Cases\nTotal Detections: {total_incorrect}')
    plt.axis('equal')
    
    # Save the figure
    plt.savefig(strategy + f'graphs/{os.path.splitext(json_file)[0]}_overall_FN.png')
    plt.close()
    
    # Print detailed statistics
    print(f"Detailed statistics for {json_file}:")
    print(f"Total detections: {total_incorrect}")
    print("Top 20 most frequent not relevant detections:")
    sorted_items = sorted(incorrect_detections.items(), key=lambda x: x[1], reverse=True)
    for cwe, count in sorted_items[:20]:
        print(f"{cwe}: {count} times ({(count/total_incorrect)*100:.1f}%)")
    
    if len(sorted_items) > 20:
        others_sum = sum(count for _, count in sorted_items[20:])
        print(f"Others: {others_sum} times ({(others_sum/total_incorrect)*100:.1f}%)")
