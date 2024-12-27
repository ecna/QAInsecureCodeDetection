import os
import json

# Initialize an empty list for the JSON structure
json_data = []

# Get all files in the current directory
files = os.listdir(".")

# Separate "bad" and "good" files based on their naming convention
bad_files = [f for f in files if "bad" in f]
good_files = [f for f in files if "good" in f]

# Iterate over "bad" files with index
i = 0

while i < len(bad_files):
# Match pairs of files and construct the JSON structure

    good_file = good_files[i]
    bad_file = bad_files[i]

    cwe_id = bad_file[:3] + "-" + bad_file[3:6]

    # Read contents of the "bad" and "good" files
    with open(bad_file, "r") as bad_f:
        func_before_content = bad_f.read()
    with open(good_file, "r") as good_f:
        func_and_code_content = good_f.read()

    # Add a new element to the JSON list
    json_data.append({
        "data": {
            "cwe_ids": [cwe_id],
            "func_before": func_before_content,
            "func": func_and_code_content,
            "filename_good": good_file,
            "filename_bad": bad_file
        },
        "language": "lang-cpp",
        "code": func_and_code_content,
        "result": {}
    })

    i += 1

# Write the JSON structure to an output file
output_file = "output.json"
with open(output_file, "w") as json_file:
    json.dump(json_data, json_file, indent=4)

print(f"JSON file '{output_file}' created successfully.")
