@echo off
setlocal

cd /d "%~dp0client"

if not exist node_modules (
  echo Installing client dependencies...
  npm install
)

npm run dev
