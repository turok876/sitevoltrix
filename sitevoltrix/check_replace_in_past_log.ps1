$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line.Contains("replace_file_content") -and $line.Contains("app.js")) {
        $obj = ConvertFrom-Json $line
        if ($obj.tool_calls) {
            foreach ($tc in $obj.tool_calls) {
                if ($tc.name -eq "replace_file_content" -or $tc.name -eq "multi_replace_file_content") {
                    Write-Host "Found replace/multi-replace in Step $($obj.step_index)"
                    try {
                        $args = $tc.args
                        if ($args -is [string]) { $args = ConvertFrom-Json $args }
                        Write-Host " -> TargetFile: $($args.TargetFile)"
                        Write-Host " -> Description: $($args.Description)"
                        Write-Host " -> Instruction: $($args.Instruction)"
                    } catch {
                        Write-Host " -> Error: $_"
                    }
                }
            }
        }
    }
}
