$dir = "C:\Users\riel7\.gemini\antigravity\brain"
Get-ChildItem $dir | Where-Object { $_.PSIsContainer } | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime -First 15
