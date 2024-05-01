#!/bin/bash

DATABASE=$1
RENAME_DATABASE=$1
EXPORT_PATH="rethink_${DATABASE:=$EXPORT_PATH}_schema"

if [ -z "$DATABASE" ]; then
    echo "Usage: export-rethink-schema.sh <database> [rename_database] "
    exit 1
fi


if [ -d $EXPORT_PATH ]; then
    echo "The export path already exists. Would you like to overwrite it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 0
    fi
    rm -rf $EXPORT_PATH
fi

rethinkdb-export -e $DATABASE -d $EXPORT_PATH

# replace all .json files with empty arrays
find $EXPORT_PATH -type f -name "*.json" -exec bash -c "echo [] > {}" \;

# if rename database is set, rename the database in the schema
if [ -n "$RENAME_DATABASE" ]; then
    find $EXPORT_PATH -type f -name "*.info" -exec bash -c "jq '.db.name = \"$RENAME_DATABASE\"' {} > {}.tmp; mv {}.tmp {}" \;
    mv $EXPORT_PATH/$DATABASE $EXPORT_PATH/$RENAME_DATABASE
fi