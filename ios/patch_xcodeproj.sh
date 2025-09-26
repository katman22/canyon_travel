# scripts/patch_xcodeproj.sh
set -euo pipefail
PBX="CanyonTraveller.xcodeproj/project.pbxproj"

# 1) Downgrade the objectVersion so CocoaPods/xcodeproj can parse it
#    Xcode 15 uses 60; (56 also works). We'll use 60.
gsed() { sed -i "$@"; } 2>/dev/null || true
if sed --version >/dev/null 2>&1; then SED="sed -i"; else SED="sed -i ''"; fi

$SED -E 's/objectVersion = [0-9]+;/objectVersion = 60;/' "$PBX"

# 2) Set CompatibilityVersion to something xcodeproj knows (Xcode 15.0)
#    This key appears under attributes in one or more blocks.
$SED -E 's/(compatibilityVersion = )"Xcode [0-9.]+"/\1"Xcode 15.0"/g' "$PBX"

echo "Patched $PBX to objectVersion=60, compatibilityVersion=\"Xcode 15.0\""
