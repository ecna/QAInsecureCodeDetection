# Load the JSON file
import json
import os
import matplotlib.pyplot as plt
import numpy as np

# Load the JSON data
with open('strategy_analysis.json', 'r') as f:
    data = json.load(f)

# Initialize data structures for plotting
models = ['GPT', 'Gemini', 'Claude']
strategies = []
true_positives = {model: [] for model in models}
false_negatives = {model: [] for model in models}
detection_rates = {model: [] for model in models}

# Extract data from JSON
for strategy in data['strategies']:
    strategies.append(strategy['strategy_name'])
    for model in strategy['models']:
        model_name = model['model_name']
        tp = sum(cwe['detected'] for cwe in model['cwe_stats'])
        fn = sum(cwe['present'] - cwe['detected'] for cwe in model['cwe_stats'])
        total_present = sum(cwe['present'] for cwe in model['cwe_stats'])
        dr = tp / total_present if total_present > 0 else 0

        true_positives[model_name].append(tp)
        false_negatives[model_name].append(fn)
        detection_rates[model_name].append(dr)

# Plotting
x = np.arange(len(strategies))  # the label locations
width = 0.2  # the width of the bars

fig, axes = plt.subplots(1, 3, figsize=(18, 5))

# True Positives
for i, model in enumerate(models):
    axes[0].bar(x + i * width, true_positives[model], width, label=model)
axes[0].set_title('True Positives')
axes[0].set_xticks(x + width)
axes[0].set_xticklabels(strategies)
axes[0].set_ylabel('Count')
axes[0].set_ylim(0, 1000)  # Set y-axis limit to 1000
axes[0].legend()

# False Negatives
for i, model in enumerate(models):
    axes[1].bar(x + i * width, false_negatives[model], width, label=model)
axes[1].set_title('False Negatives')
axes[1].set_xticks(x + width)
axes[1].set_xticklabels(strategies)
axes[1].set_ylabel('Count')
axes[1].set_ylim(0, 1000)  # Set y-axis limit to 1000
axes[1].legend()

# Detection Rates
for i, model in enumerate(models):
    axes[2].bar(x + i * width, detection_rates[model], width, label=model)
axes[2].set_title('Detection Rates')
axes[2].set_xticks(x + width)
axes[2].set_xticklabels(strategies)
axes[2].set_ylabel('Rate')
axes[2].set_ylim(0, 1)  # Keep detection rate between 0 and 1
axes[2].legend()

# Add gridlines for better readability
for ax in axes:
    ax.grid(True, linestyle='--', alpha=0.7)

plt.tight_layout()
# Save the figure
plt.savefig('compareStrategies.png')

# Print the exact numbers for reference
print("\
Exact numbers for Strategy 1:")
print("\
True Positives:")
for model in models:
    print(f"{model}: {true_positives[model][0]}")
print("\
False Negatives:")
for model in models:
    print(f"{model}: {false_negatives[model][0]}")
print("\
Detection Rates:")
for model in models:
    print(f"{model}: {detection_rates[model][0]:.2f}")


