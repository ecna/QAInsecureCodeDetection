import os

# Directories
source_dir = "source_files"
result_dir = "result_files"

# Ensure the result directory exists
os.makedirs(result_dir, exist_ok=True)

# Iterate through all files in the source directory
for file_name in os.listdir(source_dir):
    source_path = os.path.join(source_dir, file_name)

    # Skip directories, only process files
    if os.path.isfile(source_path):
        # Split the file name and extension
        base_name, ext = os.path.splitext(file_name)

        # Create the "good" and "bad" file names
        good_file_name = f"{base_name}_good{ext}"
        bad_file_name = f"{base_name}_bad{ext}"

        # Create empty files in the result directory
        open(os.path.join(result_dir, good_file_name), 'w').close()
        open(os.path.join(result_dir, bad_file_name), 'w').close()

print("Files created successfully!")
