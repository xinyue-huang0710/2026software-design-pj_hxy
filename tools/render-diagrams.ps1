param(
    [string]$Java = 'java',
    [string]$PlantUmlJar = (Join-Path $PSScriptRoot 'plantuml\plantuml.jar')
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $PlantUmlJar -PathType Leaf)) {
    throw 'PlantUML jar missing. See doc/diagrams/README.md for setup.'
}
$diagramDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'doc\diagrams'
$sources = @(Get-ChildItem -LiteralPath $diagramDir -Filter '*.puml' | ForEach-Object { $_.FullName })
if ($sources.Count -eq 0) {
    throw 'No PlantUML sources found.'
}
foreach ($format in @('-tsvg', '-tpng')) {
    & $Java '-Djava.awt.headless=true' '-jar' $PlantUmlJar '-charset' 'UTF-8' '-failfast2' $format @sources
    if ($LASTEXITCODE -ne 0) {
        throw "PlantUML rendering failed for $format (exit $LASTEXITCODE)."
    }
}
Write-Output 'Rendered all PlantUML sources to SVG and PNG.'
