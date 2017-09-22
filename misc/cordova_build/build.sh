#!/bin/bash

root=$1
nodenev=$2

project=mobile

if [ -z "$root" ]; then
  echo "root argument required - the root path of the project"
  echo "use"
  echo "   ./cordova_build.sh ../../"
  exit
fi

assets="$root"/assets

rm -rf "$project"

# build in a subshell
(
  cd "$root"
  echo "building mobile app on root $(pwd)"
  NODE_ENV="$nodenev" PUBLIC_PATH='' ./node_modules/.bin/webpack
)

cordova create "$project" io.theeye."$project" "$project"

rm -rf "$project"/www/js/*
rm -rf "$project"/www/css
rm -rf "$project"/www/img

mkdir "$project"/www/styles

cp -r "$assets"/js/dependencies "$project"/www/js
cp -r "$assets"/styles/font-awesome "$project"/www/styles/font-awesome

mkdir "$project"/www/styles/fonts
cp -r "$assets"/fonts/theeye.* "$project"/www/styles/fonts

mkdir "$project"/www/fonts
cp -r "$assets"/fonts/glyphicons-halflings-regular.* "$project"/www/fonts

cp -r "$assets"/images "$project"/www/images

# copy bundled webpack files
cp -r "$assets"/bundles "$project"/www/

cp "$assets"/styles/bootstrap.min.css "$project"/www/styles/
cp "$assets"/styles/laurifont.css "$project"/www/styles/

cp "$assets"/index.html "$project"/www/

#
# use -i'bkp' to support sed on osx and linux
#
# relative scripts path
sed -i'bkp' -e "s/src=\(.\)\//src=\1/g" "$project"/www/index.html
# relative styles path
sed -i'bkp' -e "s/href=\(.\)\//href=\1/g" "$project"/www/index.html

maincss=$(find "$project/www/bundles/styles" -name "main.*css")

sed -i'bkp' -e "s/\/images/images/g" "$project"/www/bundles/styles/"${maincss##*/}"
