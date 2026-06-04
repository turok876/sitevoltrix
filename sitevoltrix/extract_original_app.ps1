$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.step_index -eq 8) {
        Write-Host "Step 8 content length: $($obj.content.Length)"
        # Write to temp file first
        $obj.content | Out-File -FilePath "step8_raw.txt" -Encoding utf8
        
        # Parse step8_raw.txt and extract lines that start with '<number>: '
        $rawLines = Get-Content "step8_raw.txt"
        $jsLines = @()
        $foundStart = $false
        foreach ($rl in $rawLines) {
            # Look for lines matching standard format: <number>: <content>
            if ($rl -match '^\d+:(.*)$') {
                $jsLines += $Matches[1]
                $foundStart = $true
            } elseif ($foundStart) {
                # If we already found the code block and it ended, we might want to stop or check
                # But sometimes lines might span multiple lines if there were carriage returns.
                # However, Get-Content reads line by line.
            }
        }
        
        Write-Host "Extracted $($jsLines.Count) lines of JS."
        # Join with CRLF and save
        $jsContent = $jsLines -join "`r`n"
        $jsContent | Out-File -FilePath "app_original.js" -Encoding utf8
        Write-Host "Saved to app_original.js"
    }
}
