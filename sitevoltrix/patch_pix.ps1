$raw = [System.IO.File]::ReadAllBytes("$PSScriptRoot\app.js")
$content = [System.Text.Encoding]::GetEncoding(1252).GetString($raw)

# 1. Replace startPixSimulation function - replace just the first lines
$oldText = @"
function startPixSimulation() {
  // Generate random Pix Copy and Paste key
  const randomPixKey = ``00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com5204000053039865405`${calculateTotal().toFixed(2)}5802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304`${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}``
  
  const keyElement = document.getElementById('pix-key-val');
  if (keyElement) keyElement.textContent = randomPixKey;
"@

$newText = @"
function startPixSimulation() {
  // Gerar codigo Pix Copia e Cola usando chave configurada pelo admin
  var pixConfig = loadPixConfig();
  var pixCopyPaste;

  if (pixConfig && pixConfig.chave) {
    pixCopyPaste = generatePixCode(pixConfig.chave, pixConfig.nome || 'VOLTRIX STORE', pixConfig.cidade || 'Sao Paulo', calculateTotal());
  } else {
    pixCopyPaste = '00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com5204000053039865405' + calculateTotal().toFixed(2) + '5802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
  }

  const keyElement = document.getElementById('pix-key-val');
  if (keyElement) keyElement.textContent = pixCopyPaste;
"@

if ($content.Contains("Generate random Pix Copy")) {
    $content = $content.Replace($oldText, $newText)
    Write-Host "OK: startPixSimulation atualizada"
} else {
    Write-Host "WARN: nao encontrou startPixSimulation exata, tentando abordagem por linha..."
    # Fallback: replace line by line
    $content = $content.Replace("// Generate random Pix Copy and Paste key", "// Gerar codigo Pix Copia e Cola usando chave configurada pelo admin")
    $content = $content.Replace("const randomPixKey = ``", "var pixConfig = loadPixConfig();`n  var pixCopyPaste;`n  if (pixConfig && pixConfig.chave) {`n    pixCopyPaste = generatePixCode(pixConfig.chave, pixConfig.nome || 'VOLTRIX STORE', pixConfig.cidade || 'Sao Paulo', calculateTotal());`n  } else {`n    pixCopyPaste = '00020101021226930014br.gov.bcb.pix2571")
    Write-Host "OK: fallback aplicado"
}

# 2. Add Pix config functions before the closing comment
$endMarker = "// ==================== /ADMIN SYSTEM ===================="
$pixFunctions = @'

// ==================== PIX CONFIG SYSTEM ====================

function loadPixConfig() {
  var saved = localStorage.getItem('sitevoltrix_pix_config');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) { return null; }
  }
  return null;
}

function savePixConfigToStorage(config) {
  localStorage.setItem('sitevoltrix_pix_config', JSON.stringify(config));
}

function openPixConfigModal() {
  if (!adminLoggedIn) return;
  var modal = document.getElementById('pix-config-modal');
  if (!modal) return;

  var config = loadPixConfig();
  if (config) {
    var tipoSelect = document.getElementById('pix-tipo');
    var chaveInput = document.getElementById('pix-chave');
    var nomeInput = document.getElementById('pix-nome');
    var cidadeInput = document.getElementById('pix-cidade');
    var statusBox = document.getElementById('pix-status-box');
    var statusText = document.getElementById('pix-status-text');
    var removeBtn = document.getElementById('pix-remove-btn');

    if (tipoSelect) tipoSelect.value = config.tipo || 'cpf';
    if (chaveInput) chaveInput.value = config.chave || '';
    if (nomeInput) nomeInput.value = config.nome || '';
    if (cidadeInput) cidadeInput.value = config.cidade || 'Sao Paulo';

    if (statusBox && config.chave) {
      statusBox.style.display = 'flex';
      var tipoLabel = {'cpf':'CPF','cnpj':'CNPJ','email':'E-mail','telefone':'Telefone','aleatoria':'Chave Aleatoria'};
      if (statusText) statusText.textContent = 'Chave ' + (tipoLabel[config.tipo] || 'Pix') + ' configurada: ' + maskPixKey(config.chave, config.tipo);
    }
    if (removeBtn) removeBtn.style.display = 'flex';
  } else {
    var statusBox2 = document.getElementById('pix-status-box');
    var removeBtn2 = document.getElementById('pix-remove-btn');
    if (statusBox2) statusBox2.style.display = 'none';
    if (removeBtn2) removeBtn2.style.display = 'none';
    var form = document.getElementById('pix-config-form');
    if (form) form.reset();
  }

  modal.style.display = 'flex';
  requestAnimationFrame(function() { modal.classList.add('open'); });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closePixConfigModal() {
  var modal = document.getElementById('pix-config-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(function() { modal.style.display = 'none'; }, 300);
}

function savePixConfig(event) {
  event.preventDefault();
  if (!adminLoggedIn) return;

  var tipo = document.getElementById('pix-tipo').value;
  var chave = document.getElementById('pix-chave').value.trim();
  var nome = document.getElementById('pix-nome').value.trim();
  var cidade = document.getElementById('pix-cidade').value.trim() || 'Sao Paulo';

  if (!chave || !nome) {
    showToast('Preencha a chave Pix e o nome do titular.');
    return;
  }

  var config = { tipo: tipo, chave: chave, nome: nome, cidade: cidade };
  savePixConfigToStorage(config);
  showToast('Chave Pix salva com sucesso! Os pagamentos agora vao para sua conta.');
  closePixConfigModal();
}

function removePixConfig() {
  if (!adminLoggedIn) return;
  if (!confirm('Tem certeza que deseja remover a chave Pix?')) return;
  localStorage.removeItem('sitevoltrix_pix_config');
  showToast('Chave Pix removida.');
  closePixConfigModal();
}

function maskPixKey(chave, tipo) {
  if (!chave) return '***';
  if (tipo === 'cpf' && chave.length >= 6) {
    return chave.substring(0, 3) + '.***.***-' + chave.slice(-2);
  }
  if (tipo === 'email' && chave.includes('@')) {
    var parts = chave.split('@');
    return parts[0].substring(0, 2) + '***@' + parts[1];
  }
  if (tipo === 'telefone' && chave.length >= 6) {
    return chave.substring(0, 4) + '****' + chave.slice(-2);
  }
  if (chave.length > 8) {
    return chave.substring(0, 4) + '****' + chave.slice(-4);
  }
  return chave.substring(0, 3) + '***';
}

// Gerar codigo Pix EMV (Copia e Cola)
function generatePixCode(chave, nome, cidade, valor) {
  function tlv(id, value) {
    var len = value.length.toString().padStart(2, '0');
    return id + len + value;
  }

  var payload = '';
  payload += tlv('00', '01');
  payload += tlv('01', '12');

  var gui = tlv('00', 'br.gov.bcb.pix');
  var key = tlv('01', chave);
  payload += tlv('26', gui + key);

  payload += tlv('52', '0000');
  payload += tlv('53', '986');

  if (valor > 0) {
    payload += tlv('54', valor.toFixed(2));
  }

  payload += tlv('58', 'BR');

  var nomeClean = nome.substring(0, 25).replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  payload += tlv('59', nomeClean);

  var cidadeClean = cidade.substring(0, 15).replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  payload += tlv('60', cidadeClean);

  payload += tlv('62', tlv('05', '***'));

  payload += '6304';

  var crc = crc16CCITT(payload);
  payload += crc;

  return payload;
}

function crc16CCITT(str) {
  var crc = 0xFFFF;
  for (var i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (var j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

'@

if ($content.Contains($endMarker)) {
    $content = $content.Replace($endMarker, $pixFunctions + "`r`n" + $endMarker)
    Write-Host "OK: funcoes Pix adicionadas"
} else {
    Write-Host "ERRO: marcador de fim nao encontrado"
}

# Save with same encoding
$bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($content)
[System.IO.File]::WriteAllBytes("$PSScriptRoot\app.js", $bytes)
Write-Host "Arquivo salvo com sucesso!"
