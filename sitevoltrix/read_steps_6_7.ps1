$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.step_index -eq 6 -or $obj.step_index -eq 7) {
        Write-Host "Step $($obj.step_index): Type: $($obj.type) | Source: $($obj.source)"
        if ($obj.content) {
            Write-Host " -> Content Length: $($obj.content.Length)"
            if ($obj.content.Length -lt 500) {
                Write-Host $obj.content
            } else {
                Write-Host "Starts with: $($obj.content.Substring(0, 300))"
            }
        }
        if ($obj.tool_calls) {
            Write-Host " -> Tool Calls:"
            $obj.tool_calls | ForEach-Object { Write-Host "    $($_.name) with args: $($_.args)" }
        }
    }
}
