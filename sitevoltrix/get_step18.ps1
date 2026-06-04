$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.step_index -eq 18) {
        Write-Host "Step 18 found!"
        Write-Host "Type: $($obj.type)"
        Write-Host "Source: $($obj.source)"
        if ($obj.content) {
            Write-Host "Content length: $($obj.content.Length)"
            $obj.content | Out-File -FilePath "step18_content.txt" -Encoding utf8
            Write-Host "Content written to step18_content.txt"
        } else {
            Write-Host "No content in step 18"
        }
        if ($obj.tool_calls) {
            Write-Host "Tool calls present"
        }
    }
}
