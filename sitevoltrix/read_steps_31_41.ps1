$logPath = "C:\Users\riel7\.gemini\antigravity\brain\3d56fc1f-a38f-4da9-8ef3-3d353df922b7\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    $idx = $obj.step_index
    if ($idx -ge 31 -and $idx -le 41) {
        Write-Host "Step $($idx) - Type: $($obj.type) | Source: $($obj.source)"
        if ($obj.content) {
            Write-Host " -> Content Length: $($obj.content.Length)"
            if ($obj.content.Length -lt 1500) {
                Write-Host $obj.content
            } else {
                Write-Host "Starts with: $($obj.content.Substring(0, 500))"
            }
        }
        if ($obj.tool_calls) {
            $obj.tool_calls | ForEach-Object {
                Write-Host " -> Tool Call: $($_.name)"
                try {
                    $args = $_.args
                    if ($args -is [string]) { $args = ConvertFrom-Json $args }
                    Write-Host "    CommandLine: $($args.CommandLine)"
                } catch {
                    Write-Host "    Args: $($_.args)"
                }
            }
        }
    }
}
