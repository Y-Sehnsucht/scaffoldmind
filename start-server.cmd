@echo off
setlocal

cd /d "%~dp0server"

if not exist node_modules (
  echo Installing server dependencies...
  npm install
)

npm run dev
