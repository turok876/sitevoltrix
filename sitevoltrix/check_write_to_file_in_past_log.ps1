$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line.Contains("write_to_file") -and $line.Contains("app.js")) {
        $obj = ConvertFrom-Json $line
        if ($obj.tool_calls) {
            foreach ($tc in $obj.tool_calls) {
                if ($tc.name -eq "write_to_file") {
                    Write-Host "Found write_to_file containing app.js in Step $($obj.step_index)"
                    try {
                        $args = $tc.args
                        if ($args -is [string]) { $args = ConvertFrom-Json $args }
                        if ($args.TargetFile -and $args.TargetFile.Contains("app.js")) {
                            Write-Host " -> TargetFile: $($args.TargetFile)"
                            if ($args.CodeContent) {
                                Write-Host " -> Content Length: $($args.CodeContent.Length)"
                                $fileName = "past_write_step_$($obj.step_index)_content.js"
                                $args.CodeContent | Out-File -FilePath $fileName -Encoding utf8
                                Write-Host " -> Saved to $fileName"
                            }
                        }
                    } catch {
                        Write-Host " -> Failed: $_"
                    }
                }
            }
        }
    }
}
