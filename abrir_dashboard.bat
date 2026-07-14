@echo off
title AI Biometrics Dashboard - Servidor Local Moderno
color 0B
echo ========================================================================
echo   INICIANDO SERVIDOR LOCAL MODERNIZADO (REACT + VITE + IA EN VIVO)
echo ========================================================================
echo.
echo [1/2] Verificando compilación del Dashboard Multi-Pestañas...
cd /d "%~dp0dashboard"
call npm run build
echo.
echo [2/2] Abriendo servidor local y tu navegador en http://localhost:4173 ...
echo.
echo ========================================================================
echo   NOTA: Deja esta ventana abierta mientras usas el Dashboard local.
echo   Para cerrar el servidor, presiona CTRL + C o cierra esta ventana.
echo ========================================================================
echo.
call npm run preview -- --port 4173 --open
exit
