$files = Get-ChildItem -Path "c:\Users\Administrator\arcolytetech\Arcolyte\client\src" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content

    $content = $content -replace 'â†’', '→'
    $content = $content -replace 'â€¢', '•'
    $content = $content -replace 'âœ“', '✓'
    $content = $content -replace 'â€¦', '…'

    if ($original -cne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Output "Fixed encoding in: $($file.Name)"
    }
}
