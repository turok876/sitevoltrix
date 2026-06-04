$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.step_index -eq 11) {
        Write-Host "Step 11 found!"
        Write-Host "Type: $($obj.type)"
        Write-Host "Source: $($obj.source)"
        if ($obj.content) {
            Write-Host "Content length: $($obj.content.Length)"
            # Write content to a temporary file
            $obj.content | Out-File -FilePath "step11_content.txt" -Encoding utf8
            Write-Host "Content written to step11_content.txt"
        }
    }
}
