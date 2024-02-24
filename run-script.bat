@echo off
setlocal

:: Ask for user email
set /p email=Enter your email: 

:: Ask for password (Note: CMD does not support silent/secure input directly)
set /p password=Enter your password: 

:: Ask for site URL
set /p url=Enter the site url: 

:: Ask for output path
set /p outputPath=Enter the output path: 

:: Set environment variables
set EMAIL=%email%
set PASSWORD=%password%
set URL=%url%
set OUTPUT_PATH=%outputPath%

:: Execute npm command
npm run execute

:: Clear sensitive information from environment
set EMAIL=
set PASSWORD=

endlocal