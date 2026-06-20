$cssFile = "c:\Users\Administrator\arcolytetech\Arcolyte\client\src\index.css"
$content = Get-Content $cssFile -Raw

# HSL Replacements (Green to Gold)
$content = $content -replace '142 70% 38%', '45 95% 50%'
$content = $content -replace '142 65% 30%', '45 95% 40%'
$content = $content -replace '142 60% 52%', '45 100% 60%'
$content = $content -replace '142 65% 28%', '45 95% 30%'
$content = $content -replace '142 55% 42%', '45 95% 45%'
$content = $content -replace '142 70% 30%', '45 95% 40%'
$content = $content -replace '142 65% 25%', '45 95% 35%'

# Cyan/Purple to White/Gold
$content = $content -replace '195 100% 50%', '0 0% 100%'
$content = $content -replace '195 80% 28%', '0 0% 10%'
$content = $content -replace '270 80% 65%', '45 95% 60%'
$content = $content -replace '270 60% 42%', '45 95% 40%'
$content = $content -replace '210 100% 55%', '0 0% 90%'
$content = $content -replace '210 90% 35%', '0 0% 20%'

# Backgrounds to Pure Black
$content = $content -replace '220 20% 4%', '0 0% 0%'
$content = $content -replace '220 15% 8%', '0 0% 5%'
$content = $content -replace '220 20% 6%', '0 0% 3%'
$content = $content -replace '220 15% 12%', '0 0% 8%'
$content = $content -replace '220 15% 14%', '0 0% 10%'

# RGB Green to RGB Gold
$content = $content -replace '34, 130, 70', '212, 175, 55'
# RGB Cyan to RGB White
$content = $content -replace '0, 212, 255', '255, 255, 255'

Set-Content -Path $cssFile -Value $content -Encoding UTF8

# HTML Meta Theme Color
$htmlFile = "c:\Users\Administrator\arcolytetech\Arcolyte\client\index.html"
$htmlContent = Get-Content $htmlFile -Raw
$htmlContent = $htmlContent -replace 'content="#0f4d2a"', 'content="#000000"'
Set-Content -Path $htmlFile -Value $htmlContent -Encoding UTF8

# Tailwind Config Hex
$twFile = "c:\Users\Administrator\arcolytetech\Arcolyte\tailwind.config.ts"
$twContent = Get-Content $twFile -Raw
$twContent = $twContent -replace '"#22c55e"', '"#D4AF37"'
Set-Content -Path $twFile -Value $twContent -Encoding UTF8

Write-Output "Theme updated to Gold, Black, and White."
