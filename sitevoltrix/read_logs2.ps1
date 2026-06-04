$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $obj = ConvertFrom-Json $line
        Write-Host "Step: $($obj.step_index) | Type: $($obj.type) | Source: $($obj.source)"
    } catch {
        Write-Host "Error parsing line: $_"
    }
}
