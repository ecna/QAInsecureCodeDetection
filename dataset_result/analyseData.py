import json
import matplotlib.pyplot as plt


# Load the JSON data
with open('./responseClaude.json') as f:
    data = json.load(f)

foundCWE = 0
notFoundCWE = 0
cwe_counts = {}

# Initialize the dictionary with all possible CWE IDs
for entry in data:
    cwe_id = int(entry['data']['cwe_ids'][0].replace('CWE-', ''))
    if cwe_id not in cwe_counts:
        cwe_counts[cwe_id] = {'found': 0, 'not_found': 0}

# Count found and not found CWEs
for entry in data:
    cwe_id = int(entry['data']['cwe_ids'][0].replace('CWE-', ''))
    if entry['result'] is None:
        continue
    if cwe_id in entry['result']['CWEs']:
        cwe_counts[cwe_id]['found'] += 1
    else:
        cwe_counts[cwe_id]['not_found'] += 1

# Prepare data for plotting
cwe_ids = list(cwe_counts.keys())
found_counts = [cwe_counts[cwe_id]['found'] for cwe_id in cwe_ids]
not_found_counts = [cwe_counts[cwe_id]['not_found'] for cwe_id in cwe_ids]

# Plot the data
x = range(len(cwe_ids))
plt.bar(x, found_counts, width=0.4, label='Found', color='green', align='center')
plt.bar(x, not_found_counts, width=0.4, label='Not Found', color='red', align='edge')
plt.xlabel('CWE ID')
plt.ylabel('Count')
plt.title('CWE Detection Results per CWE ID')
plt.xticks(x, cwe_ids, rotation='vertical')
plt.legend()
plt.tight_layout()
plt.show()
