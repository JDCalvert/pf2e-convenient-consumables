# Set up FVTT CLI to point to this folder
fvtt configure set dataPath E:/Foundry/Data/dev/foundrydata-v13-dev
fvtt package workon "pf2e-convenient-consumables" --type "Module"

rm -r packs

fvtt package pack macros --in packs-source/macros --out packs

7z u pf2e-convenient-consumables.zip -uq0 art/ lang/ lib/ packs/ scripts/ styles/ CHANGELOG.md module.json README.md
