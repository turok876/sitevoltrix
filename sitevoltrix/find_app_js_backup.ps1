$searchPath = "C:\Users\riel7"
$excludePatterns = @("*\node_modules\*", "*\AppData\Local\Microsoft\*", "*\AppData\Local\Google\*", "*\AppData\Local\Package Cache\*")

# Search for files containing 'voltrix-admin-2025' or 'sitevoltrix_products'
Get-ChildItem -Path $searchPath -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object {
        $filePath = $_.FullName
        $skip = $false
        foreach ($pattern in $excludePatterns) {
            if ($filePath -like $pattern) { $skip = $true; break }
        }
        $skip -eq $false
    } | 
    ForEach-Object {
        try {
            $content = [System.IO.File]::ReadAllText($_.FullName)
            if ($content.Contains("voltrix-admin-2025") -or $content.Contains("sitevoltrix_products")) {
                Write-Host "Found matching JS file: $($_.FullName) (Size: $($_.Length) bytes)"
            }
        } catch {}
    }
