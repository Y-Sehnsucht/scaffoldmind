@echo off
setlocal

set "ROOT_DIR=%~dp0"

start "ScaffoldMind Server" cmd /k ""%ROOT_DIR%start-server.cmd""
start "ScaffoldMind Client" cmd /k ""%ROOT_DIR%start-client.cmd""

echo ScaffoldMind dev servers are starting in separate windows...
