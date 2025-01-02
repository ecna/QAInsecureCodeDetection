import json
import pandas as pd

# Load the JSON data
with open('strategy4/responseGPT.json', 'r') as file:
    data = json.load(file)

# Define the CWEs to collect
cwes_to_collect = ["CWE-190", "CWE-401", "CWE-415", "CWE-416", "CWE-476", "CWE-590", "CWE-775", "CWE-762", "CWE-773", "CWE-789"]

# Initialize the result dictionary
result = {cwe: {"TP": None, "FN": None, "FP": None} for cwe in cwes_to_collect}

# Iterate through the data and collect the required items
for item in data:
    cwe = item['data']['cwe']
    if cwe in cwes_to_collect:
        if item['data']['type'] == "TP" and result[cwe]["TP"] is None:
            result[cwe]["TP"] = item
        elif item['data']['type'] == "FN" and result[cwe]["FN"] is None:
            result[cwe]["FN"] = item
        elif item['data']['type'] == "FP" and result[cwe]["FP"] is None:
            result[cwe]["FP"] = item

# Filter out CWEs that do not have all three items (TP, FN, FP)
final_result = {cwe: [result[cwe]["TP"], result[cwe]["FN"], result[cwe]["FP"]] for cwe in result if None not in result[cwe].values()}

# Convert the result to an array format
final_result_array = [{"cwe": cwe, "items": items} for cwe, items in final_result.items()]

# Transpose the data for each CWE
transposed_result = {}
for cwe, items in final_result.items():
    transposed_result[cwe] = {
        
        "TP": {
            "actual_cwes": items[0]['data']['actual_cwes'],
            "predicted_cwes": items[0]['data']['predicted_cwes'],
            "Vulnerabilities Found": [v for v in items[0]['result']['Vulnerabilities Found'].values() if cwe in v]
        },
        "FN": {
            "actual_cwes": items[1]['data']['actual_cwes'],
            "predicted_cwes": items[1]['data']['predicted_cwes'],
            "Vulnerabilities Found": [v for v in items[1]['result']['Vulnerabilities Found'].values() if cwe in v]
        },
        "FP": {
            "actual_cwes": items[2]['data']['actual_cwes'],
            "predicted_cwes": "["+ cwe + "]",
            "Vulnerabilities Found": [v for v in items[2]['result']['Vulnerabilities Found'].values() if cwe in v]
        }
    }

# Create a DataFrame for each CWE with transposed data
for cwe, items in transposed_result.items():
    table_data = {
        "Type": ["actual_cwes", "predicted_cwes", "Vulnerabilities Found"],
        "TP": [items["TP"]["actual_cwes"], items["TP"]["predicted_cwes"], items["TP"]["Vulnerabilities Found"]],
        "FN": [items["FN"]["actual_cwes"], items["FN"]["predicted_cwes"], items["FN"]["Vulnerabilities Found"]],
        "FP": [items["FP"]["actual_cwes"], items["FP"]["predicted_cwes"], items["FP"]["Vulnerabilities Found"]]
    }
    df = pd.DataFrame(table_data)
    print(f"Table for {cwe}:")
    print(df)
    print("\n")
    df.to_csv(f"strategy4/tables/{cwe}_table.csv", index=False, sep=';')

