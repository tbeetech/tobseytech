$files = Get-ChildItem -Path . -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.html,*.css,*.json,*.md,*.txt -Exclude node_modules,package-lock.json,.git,*.svg,*.png,*.jpg,*.pdf,*.zip,*.woff,*.woff2,*.ttf

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content

    # Favicon replacements
    $content = $content -replace '/favicon\.svg', '/arcolytelogo.png'
    $content = $content -replace 'favicon\.svg', 'arcolytelogo.png'

    if ($original -cne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Output "Updated: $($file.FullName)"
    }
}
