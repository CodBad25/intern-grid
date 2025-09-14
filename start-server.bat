@echo off
echo Demarrage du serveur V2 avec corrections...
echo.
cd /d "D:\DEV\SUIVI STAG-V2\intern-grid-main"
echo Dossier actuel: %CD%
echo.
echo Nettoyage du cache...
npm run build:dev 2>nul
echo.
echo Lancement sur port 5174...
npm run dev
echo.
pause
