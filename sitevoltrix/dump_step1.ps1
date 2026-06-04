$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.step_index -eq 1) {
        Write-Host "Step 1 found! Length: $($obj.content.Length)"
        $obj.content | Out-File -FilePath "step1_content.txt" -Encoding utf8
        Write-Host "Written to step1_content.txt"
    }
}
