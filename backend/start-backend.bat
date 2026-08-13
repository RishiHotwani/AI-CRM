@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
cd /d "%~dp0"
if not exist "target\nexusai-crm-1.0.0-SNAPSHOT.jar" (
    echo Building NexusAI CRM Backend package...
    call mvnw.cmd package -DskipTests
)
echo ===================================================
echo   Starting NexusAI CRM Backend (Java 21 Spring Boot)
echo ===================================================
"%JAVA_HOME%\bin\java.exe" -jar target\nexusai-crm-1.0.0-SNAPSHOT.jar
pause
