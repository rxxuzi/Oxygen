#!/bin/sh

ERR_DIR="./report"

# Function to save error log
log_error() {
    DATE=$(date +%Y-%m-%d)
    TIME=$(date +%H:%M:%S)
    ERROR_LOG_FILE="$ERR_DIR/error-$DATE.log"

    if [ ! -d "$ERR_DIR" ]; then
        mkdir "$ERR_DIR"
    fi

    STATUS=${1:-}
    MESSAGE=${2:-}

    echo "[$TIME] Status: $STATUS, Message: $MESSAGE" >> $ERROR_LOG_FILE
}


# Compile the C# code
# shellcheck disable=SC2164
cd app/
C:/Windows/Microsoft.NET/Framework/v4.0.30319/csc /out:./oxygen-tmp.exe ./*.cs
compile_status=$?

if [ $compile_status -eq 0 ]; then
    cd ..
    mv app/oxygen-tmp.exe ./oxygen.exe
    echo "Compilation successful, executable created."
else
    cd ..
    log_error $compile_status "Compilation failed"
    exit $compile_status
fi


