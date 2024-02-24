#!/bin/bash

# Ask for user email
read -p "Enter your email: " email

# Silent password input
read -sp "Enter your password: " password
printf "\n" # New line after

# Ask for site URL
read -p "Enter the site url: " url

# Ask for output path
read -p "Enter the output path: " outputPath

# Export environment variables
export EMAIL="$email"
export PASSWORD="$password"
export URL="$url"
export OUTPUT_PATH="$outputPath"

# Execute npm command
npm run execute