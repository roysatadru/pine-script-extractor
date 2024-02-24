# Ask for user email
$email = Read-Host -Prompt "Enter your email"

# Silent password input
$password = Read-Host -Prompt "Enter your password" -AsSecureString

# Ask for site URL
$url = Read-Host -Prompt "Enter the site url"

# Ask for output path
$outputPath = Read-Host -Prompt "Enter the output path"

# Convert the SecureString to BSTR, then to a plain text string
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} finally {
    # Always free the BSTR to prevent memory leaks
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

# Set environment variables
$env:EMAIL = $email
$env:PASSWORD = $plainPassword
$env:URL = $url
$env:OUTPUT_PATH = $outputPath

# Execute npm command
npm run execute
