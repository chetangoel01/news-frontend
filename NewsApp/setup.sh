#!/bin/bash

# Create fonts directory
mkdir -p src/assets/fonts

# Download and extract Inter font
curl -L 'https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip' -o /tmp/inter.zip
unzip /tmp/inter.zip -d src/assets/fonts/inter

# Download and extract Lora font
curl -L 'https://github.com/cyrealtype/Lora-Cyrillic/archive/refs/heads/master.zip' -o /tmp/lora.zip
unzip /tmp/lora.zip -d src/assets/fonts/lora

# Clean up
rm /tmp/inter.zip /tmp/lora.zip