$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    $isCommand = $false
    $commandLine = ""
    
    if ($obj.tool_calls) {
        foreach ($tc in $obj.tool_calls) {
            if ($tc.name -eq "run_command") {
                $isCommand = $true
                try {
                    $args = $tc.args
                    if ($args -is [string]) { $args = ConvertFrom-Json $args }
                    $commandLine = $args.CommandLine
                } catch {
                    $commandLine = $tc.args
                }
            }
        }
    }
    
    if ($isCommand -or $obj.type -eq "RUN_COMMAND") {
        Write-Host "Step: $($obj.step_index) | Type: $($obj.type) | Command: $commandLine"
        if ($obj.content -and $obj.content.Contains("VOLTRIX STORE")) {
            Write-Host " -> Output Contains 'VOLTRIX STORE'! Length: $($obj.content.Length)"
        }
    }
}
