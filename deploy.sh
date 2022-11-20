npm run build

rm -rf ../build-dist
cp -R ./build/. ../build-dist/

git checkout deploy
rm -rf ./assets
rm -rf ./static
cp -R ../build-dist/. ./
rm -rf ../build-dist

git add -A
git commit -m"✨ Release"
git push

git checkout master

echo "Deployed!"
