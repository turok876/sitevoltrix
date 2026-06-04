$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    $idx = $obj.step_index
    if ($idx -eq 3 -or $idx -eq 7 -or $idx -eq 8) {
        Write-Host "Step $($idx) - Type: $($obj.type) | Source: $($obj.source)"
        if ($obj.content) {
            Write-Host " -> Content Length: $($obj.content.Length)"
            if ($obj.content.Length -lt 2000) {
                Write-Host $obj.content
            } else {
                Write-Host "Starts with: $($obj.content.Substring(0, 1000))"
            }
        }
        if ($obj.tool_calls) {
            $obj.tool_calls | ForEach-Object {
                Write-Host " -> Tool Call: $($_.name)"
                try {
                    $args = $_.args
                    if ($args -is [string]) { $args = ConvertFrom-Json $args }
                    Write-Host "    Args: $( $args | Out-String )"
                } catch {
                    Write-Host "    Args: $($_.args)"
                }
            }
        }
    }
}
