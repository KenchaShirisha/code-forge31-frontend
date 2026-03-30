$base = "c:\Users\HP\OneDrive\Desktop\codeforge"
$dirs = @(
    "backend",
    "backend\models",
    "backend\routes",
    "backend\middleware",
    "backend\controllers",
    "backend\data",
    "frontend\src",
    "frontend\src\components",
    "frontend\src\pages",
    "frontend\src\context",
    "frontend\src\data",
    "frontend\public"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path "$base\$dir" | Out-Null
}
Write-Host "All directories created!"
