@echo off
curl -X POST http://localhost:3000/api/admin/presentations -H "Content-Type: application/json" -H "Authorization: Bearer admin2024" -d @presentations-18teams.json
echo.
curl -H "Authorization: Bearer admin2024" http://localhost:3000/api/admin/stats
