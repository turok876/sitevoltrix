$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath

foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $obj = ConvertFrom-Json $line
        # Check if this step has tool calls with app.js or has content with app.js
        $isMatch = $false
        if ($obj.content -and $obj.content.Contains("VOLTRIX STORE")) {
            $isMatch = $true
        }
        if ($obj.tool_calls) {
            foreach ($tc in $obj.tool_calls) {
                if ($tc.args -and $tc.args.Contains("app.js")) {
                    $isMatch = $true
                }
            }
        }
        
        if ($isMatch) {
            Write-Host "Step Index: $($obj.step_index) | Type: $($obj.type) | Source: $($obj.source)"
            if ($obj.content) {
                Write-Host "Content length: $($obj.content.Length)"
                if ($obj.content.Length -lt 500) {
                    Write-Host "Content: $($obj.content)"
                } else {
                    Write-Host "Content starts with: $($obj.content.Substring(0, 200))"
                }
            }
            Write-Host "----------------------------------------"
        }
    } catch {
        Write-Host "Error parsing line: $_"
    }
}
