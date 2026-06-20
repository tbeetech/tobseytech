$files = Get-ChildItem -Path . -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.html,*.css,*.json,*.md,*.txt -Exclude node_modules,package-lock.json,.git,*.svg,*.png,*.jpg,*.pdf,*.zip,*.woff,*.woff2,*.ttf

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content

    # Specific Logo paths
    $content = $content -replace 'https://i\.pinimg\.com/1200x/58/b9/9e/58b99ee7bfbbf7c0043a1950be716265\.jpg', '/arcolytelogo.png'
    $content = $content -replace 'https://tobseytech\.com/favicon\.svg', 'https://arcolytetech.com/arcolytelogo.png'
    $content = $content -replace 'src="/favicon\.svg"', 'src="/arcolytelogo.png"'
    
    # Emails
    $content = $content -replace 'tobseytech@gmail\.com', 'arcolytetech@gmail.com'
    $content = $content -replace 'CEO@TOBSEYTECH\.BIZ', 'arcolytetech@gmail.com'
    
    # Domains & Social
    $content = $content -replace 'tobseytech\.com', 'arcolytetech.com'
    $content = $content -replace '@tobseytech', '@arcolytetech'
    
    # File names
    $content = $content -replace 'tobseytech-platform-onboarding-guide\.pdf', 'arcolytetech-platform-onboarding-guide.pdf'
    
    # Company Name Cases
    $content = $content -replace 'TOBSEYTECH Logo', 'Arcolyte Technologies Logo'
    $content = $content -replace 'TOBSEYTECH', 'ARCOLYTE TECHNOLOGIES'
    $content = $content -replace 'TobseyTech', 'Arcolyte Technologies'
    $content = $content -replace 'tobseytech', 'arcolyte'

    if ($original -cne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Output "Updated: $($file.FullName)"
    }
}
