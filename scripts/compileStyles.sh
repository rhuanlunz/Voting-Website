#!/bin/sh
BASE_DIR="${0%/*}/.."

[ -d "$BASE_DIR/src/static/css" ] || mkdir "$BASE_DIR/src/static/css"

sass -scompressed \
	"$BASE_DIR/src/static/scss/generator.scss:$BASE_DIR/src/static/css/generator.css" \
	"$BASE_DIR/src/static/scss/selection.scss:$BASE_DIR/src/static/css/selection.css" \
	"$BASE_DIR/src/static/scss/error.scss:$BASE_DIR/src/static/css/error.css"
