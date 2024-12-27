import json

# Load the JSON file
with open('./sard_subset.json', 'r') as file:
    data = json.load(file)

# Process each item in the JSON array
for item in data:
    if 'data' in item and 'func' in item['data']:
        item['code'] = item['data']['func']

# Save the modified JSON back to the file
with open('./sard_good_subset.json', 'w') as file:
    json.dump(data, file, indent=4)

print('Done processing the JSON file.')

