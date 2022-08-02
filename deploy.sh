# deploy.sh

#!/usr/bin/env sh

set -e

echo Building. This may take a minute...

rm -rf temp
rm -rf dist
mkdir dist
npm run build

cd dist

mkdir ../temp
cp * ../temp
cp ../index.html ./index.html
cp ../src/404.html ./404.html

mkdir dist
mv ../temp/* dist
rm -rf ../temp
cp ../favicon.ico ./dist/favicon.ico

access_token=`cat ../access_token.txt`
repo=`echo https://$access_token@github.com/AdamSeidman/Bajadle.github.io.git`

echo Deploying...
git init
git remote add origin $repo
git add -A
git commit -m 'deploy'

git push -f $repo master

cd -
