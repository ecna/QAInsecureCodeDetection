import matplotlib.pyplot as plt
import numpy as np

# Data preparation
methods = ['GPT (AI)', 'Traditional']

# Claude data from Strategy 1
claude_tp = 689
claude_fn = 308
claude_dr = 0.69

# Traditional method data
trad_dr = 0.4562
trad_tp = int(1000 * trad_dr)  # 456 based on DR of 0.4562
trad_fn = 1000 - trad_tp       # Remaining are false negatives

# Create data arrays
true_positives = [claude_tp, trad_tp]
false_negatives = [claude_fn, trad_fn]
detection_rates = [claude_dr, trad_dr]

# Plotting
fig, axes = plt.subplots(1, 3, figsize=(18, 6))

# Bar width
width = 0.60

# Colors
ai_color = '#2ecc71'  # green
trad_color = '#3498db'  # blue

# True Positives
axes[0].bar(methods, true_positives, width, color=[ai_color, trad_color])
axes[0].set_title('True Positives', fontsize=12, pad=20)
axes[0].set_ylabel('Count')
axes[0].set_ylim(0, 1000)
axes[0].grid(True, linestyle='--', alpha=0.7)
for i, v in enumerate(true_positives):
    axes[0].text(i, v + 10, str(v), ha='center', fontsize=10)

# False Negatives
axes[1].bar(methods, false_negatives, width, color=[ai_color, trad_color])
axes[1].set_title('False Negatives', fontsize=12, pad=20)
axes[1].set_ylabel('Count')
axes[1].set_ylim(0, 1000)
axes[1].grid(True, linestyle='--', alpha=0.7)
for i, v in enumerate(false_negatives):
    axes[1].text(i, v + 10, str(v), ha='center', fontsize=10)

# Detection Rates
axes[2].bar(methods, detection_rates, width, color=[ai_color, trad_color])
axes[2].set_title('Detection Rate', fontsize=12, pad=20)
axes[2].set_ylabel('Rate')
axes[2].set_ylim(0, 1)
axes[2].grid(True, linestyle='--', alpha=0.7)
for i, v in enumerate(detection_rates):
    axes[2].text(i, v + 0.01, f'{v:.3f}', ha='center', fontsize=10)

# Adjust layout and show the plots
plt.tight_layout()
# Save the figure
plt.savefig('compare_with_traditional.png')

# Print numerical comparison
print("\
Numerical Comparison:")
print("\
Claude (AI-based):")
print(f"True Positives: {claude_tp}")
print(f"False Negatives: {claude_fn}")
print(f"Detection Rate: {claude_dr:.3f}")
print("\
Traditional Static Analysis:")
print(f"True Positives: {trad_tp}")
print(f"False Negatives: {trad_fn}")
print(f"Detection Rate: {trad_dr:.3f}")

# Calculate improvement percentage
improvement = ((claude_dr - trad_dr) / trad_dr) * 100
print(f"\
Improvement in Detection Rate: {improvement:.1f}%")