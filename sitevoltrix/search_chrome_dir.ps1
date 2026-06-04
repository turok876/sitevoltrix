$chromePath = "C:\Users\riel7\AppData\Local\Google\Chrome\User Data"
Write-Host "Searching Chrome User Data folder for project signatures..."

# Find any file containing 'voltrix-admin-2025' or 'sitevoltrix_products'
# We will read files as raw bytes to avoid encoding errors and search for the ASCII/UTF-8 representation of the strings
$searchBytes1 = [System.Text.Encoding]::UTF8.GetBytes("voltrix-admin-2025")
$searchBytes2 = [System.Text.Encoding]::UTF8.GetBytes("sitevoltrix_products")

function Search-Bytes ($fileBytes, $searchBytes) {
    if ($fileBytes.Length -lt $searchBytes.Length) { return $false }
    # Simple search
    $matchCount = 0
    for ($i = 0; $i -le ($fileBytes.Length - $searchBytes.Length); $i++) {
        $found = $true
        for ($j = 0; $j -lt $searchBytes.Length; $j++) {
            if ($fileBytes[$i + $j] -ne $searchBytes[$j]) {
                $found = $false
                break
            }
        }
        if ($found) { return $true }
    }
    return $false
}

$files = Get-ChildItem -Path $chromePath -Recurse -File -ErrorAction SilentlyContinue

foreach ($file in $files) {
    # Skip huge files (> 20MB) to make it fast
    if ($file.Length -gt 20MB -or $file.Length -lt 1KB) { continue }
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        if (Search-Bytes $bytes $searchBytes1) {
            Write-Host "FOUND MATCH 1 in: $($file.FullName) (Size: $($file.Length))"
        }
        if (Search-Bytes $bytes $searchBytes2) {
            Write-Host "FOUND MATCH 2 in: $($file.FullName) (Size: $($file.Length))"
        }
    } catch {}
}

Write-Host "Search finished."
