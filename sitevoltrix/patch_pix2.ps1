$raw = [System.IO.File]::ReadAllBytes("$PSScriptRoot\app.js")
$content = [System.Text.Encoding]::GetEncoding(1252).GetString($raw)

# Replace the first part of startPixSimulation using a simpler marker
$searchText = "function startPixSimulation() {`r`n  // Generate random Pix Copy and Paste key"
$replaceText = "function startPixSimulation() {`r`n  // Gerar codigo Pix usando chave configurada pelo admin"

if ($content.Contains("// Generate random Pix Copy and Paste key")) {
    $content = $content.Replace("// Generate random Pix Copy and Paste key", "// Gerar codigo Pix usando chave configurada pelo admin")
    Write-Host "OK: comentario atualizado"
} else {
    Write-Host "WARN: comentario ja atualizado"
}

# Now replace the randomPixKey line and keyElement lines
$oldLines = "  const randomPixKey = ``00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com5204000053039865405`${calculateTotal().toFixed(2)}5802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304`${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}``;`r`n  `r`n  const keyElement = document.getElementById('pix-key-val');`r`n  if (keyElement) keyElement.textContent = randomPixKey;"

$newLines = "  var pixConfig = loadPixConfig();`r`n  var pixCopyPaste;`r`n`r`n  if (pixConfig && pixConfig.chave) {`r`n    pixCopyPaste = generatePixCode(pixConfig.chave, pixConfig.nome || 'VOLTRIX STORE', pixConfig.cidade || 'Sao Paulo', calculateTotal());`r`n  } else {`r`n    pixCopyPaste = '00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com52040000530398654050.005802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();`r`n  }`r`n`r`n  const keyElement = document.getElementById('pix-key-val');`r`n  if (keyElement) keyElement.textContent = pixCopyPaste;"

if ($content.Contains("const randomPixKey")) {
    $content = $content.Replace($oldLines, $newLines)
    if ($content.Contains("const randomPixKey")) {
        Write-Host "WARN: replace com backticks nao funcionou, tentando alternativa..."
        # Find the line with randomPixKey and replace it manually
        $lines = $content -split "`r`n"
        $newContent = @()
        $skipNext = 0
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($skipNext -gt 0) { $skipNext--; continue }
            if ($lines[$i] -match "const randomPixKey") {
                $newContent += "  var pixConfig = loadPixConfig();"
                $newContent += "  var pixCopyPaste;"
                $newContent += ""
                $newContent += "  if (pixConfig && pixConfig.chave) {"
                $newContent += "    pixCopyPaste = generatePixCode(pixConfig.chave, pixConfig.nome || 'VOLTRIX STORE', pixConfig.cidade || 'Sao Paulo', calculateTotal());"
                $newContent += "  } else {"
                $newContent += "    pixCopyPaste = '00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com52040000530398654050.005802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();"
                $newContent += "  }"
                # Skip the empty line after randomPixKey
                if ($i + 1 -lt $lines.Count -and $lines[$i + 1].Trim() -eq '') { $skipNext++ }
                continue
            }
            if ($lines[$i] -match "if \(keyElement\) keyElement\.textContent = randomPixKey") {
                $newContent += "  if (keyElement) keyElement.textContent = pixCopyPaste;"
                continue
            }
            $newContent += $lines[$i]
        }
        $content = $newContent -join "`r`n"
        Write-Host "OK: substituicao por linhas aplicada"
    } else {
        Write-Host "OK: randomPixKey substituida"
    }
} else {
    Write-Host "WARN: randomPixKey nao encontrada (ja substituida?)"
}

$bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($content)
[System.IO.File]::WriteAllBytes("$PSScriptRoot\app.js", $bytes)
Write-Host "Arquivo salvo!"
