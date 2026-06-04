$logPath = "C:\Users\riel7\.gemini\antigravity\brain\a2a15f22-980a-4a35-a8f5-eeebb0d92662\.system_generated\logs\transcript.jsonl"
$lines = Get-Content $logPath
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $obj = ConvertFrom-Json $line
    $idx = $obj.step_index
    if ($idx -eq 19 -or $idx -eq 25 -or $idx -eq 87 -or $idx -eq 280 -or $idx -eq 284) {
        Write-Host "--- Step $idx ---"
        if ($obj.tool_calls) {
            foreach ($tc in $obj.tool_calls) {
                Write-Host "Tool name: $($tc.name)"
                Write-Host "Args type: $($tc.args.GetType().FullName)"
                $argsStr = $tc.args | Out-String
                Write-Host "Args raw string length: $($argsStr.Length)"
                # Let's try to convert and output the target file and content length
                try {
                    $args = $tc.args
                    if ($args -is [string]) { $args = ConvertFrom-Json $args }
                    # Print all member names
                    $members = $args | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
                    Write-Host "Properties: $($members -join ', ')"
                    
                    # Try uppercase/lowercase match
                    $targetFile = ""
                    $codeContent = ""
                    foreach ($m in $members) {
                        if ($m.ToLower() -eq "targetfile") { $targetFile = $args.$m }
                        if ($m.ToLower() -eq "codecontent") { $codeContent = $args.$m }
                    }
                    Write-Host "TargetFile: $targetFile"
                    Write-Host "CodeContent length: $($codeContent.Length)"
                    if ($codeContent.Length -gt 0) {
                        $fileName = "past_write_step_${idx}.js"
                        $codeContent | Out-File -FilePath $fileName -Encoding utf8
                        Write-Host " -> Saved to $fileName"
                    }
                } catch {
                    Write-Host " -> Try block error: $_"
                }
            }
        }
    }
}
