$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    if ($obj.type -eq "VIEW_FILE" -or $obj.tool_calls) {
        $files = @()
        if ($obj.tool_calls) {
            foreach ($tc in $obj.tool_calls) {
                if ($tc.name -eq "view_file") {
                    # Convert args from JSON if needed, or if it is already an object
                    try {
                        $args = $tc.args
                        if ($args -is [string]) { $args = ConvertFrom-Json $args }
                        $files += $args.AbsolutePath
                    } catch {}
                }
            }
        }
        if ($files.Count -gt 0 -or $obj.type -eq "VIEW_FILE") {
            Write-Host "Step: $($obj.step_index) | Type: $($obj.type) | Files: $($files -join ', ')"
        }
    }
}
