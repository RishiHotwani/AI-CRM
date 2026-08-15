@echo off
echo Starting Cloudflare Tunnel for Clinch CRM Backend (port 8080)...
"%~dp0cloudflared.exe" tunnel --url http://localhost:8080
pause
