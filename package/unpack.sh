# Set up FVTT CLI to point to this folder
fvtt configure set dataPath E:/Foundry/Data/dev/foundrydata-v13-dev
fvtt package workon "pf2e-convenient-consumables" --type "Module"

rm -r packs-source

fvtt package unpack macros --in packs --out packs-source/macros
