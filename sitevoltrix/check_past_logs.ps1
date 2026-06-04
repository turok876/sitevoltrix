$pastConvs = @("eebee72a-8d5b-4c67-a8b9-ac7247b7bcb0", "a2a15f22-980a-4a35-a8f5-eeebb0d92662")
foreach ($conv in $pastConvs) {
    $logPath = "C:\Users\riel7\.gemini\antigravity\brain\$conv\.system_generated\logs\transcript.jsonl"
    if (Test-Path $logPath) {
        Write-Host "Log found for $conv. Searching for sitevoltrix..."
        $content = Get-Content $logPath -Raw
        if ($content -and $content.Contains("sitevoltrix")) {
            Write-Host " -> $conv has reference to sitevoltrix!"
            # Find steps that read or edit app.js in this past conversation
            $lines = Get-Content $logPath
            foreach ($line in $lines) {
                if ([string]::IsNullOrWhiteSpace($line)) { continue }
                $obj = ConvertFrom-Json $line
                if ($line.Contains("app.js")) {
                    Write-Host "    Step $($obj.step_index) in $conv contains app.js"
                }
            }
        } else {
            Write-Host " -> $conv does NOT reference sitevoltrix."
        }
    } else {
        Write-Host "No log path: $logPath"
    }
}
