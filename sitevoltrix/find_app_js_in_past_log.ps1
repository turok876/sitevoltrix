$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    # We want to check if this is a view_file tool output or write_to_file that contains app.js content.
    # Typically, if the step is a VIEW_FILE or contains the file content, the content size will be large (e.g. > 10000 bytes)
    # and contain 'VOLTRIX STORE'
    $hasAppJs = $false
    if ($obj.content -and $obj.content.Contains("VOLTRIX STORE")) {
        $hasAppJs = $true
    }
    if ($hasAppJs) {
        Write-Host "Found Step $($obj.step_index) in past conversation with length $($obj.content.Length)"
        # Write this content to a separate file to inspect
        $fileName = "past_step_$($obj.step_index)_content.txt"
        $obj.content | Out-File -FilePath $fileName -Encoding utf8
        Write-Host " -> Saved to $fileName"
    }
}
