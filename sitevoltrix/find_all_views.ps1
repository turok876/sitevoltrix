$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    $hasAppJs = $false
    if ($obj.content -and $obj.content.Contains("app.js")) { $hasAppJs = $true }
    if ($obj.tool_calls) {
        foreach ($tc in $obj.tool_calls) {
            if ($tc.args -and $tc.args.Contains("app.js")) { $hasAppJs = $true }
        }
    }
    if ($hasAppJs) {
        Write-Host "Step: $($obj.step_index) | Type: $($obj.type) | Source: $($obj.source)"
        if ($obj.content -and $obj.content.Contains("VOLTRIX STORE")) {
            Write-Host " -> Contains 'VOLTRIX STORE' in Content! Length: $($obj.content.Length)"
        }
    }
}
