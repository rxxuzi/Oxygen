#!/bin/bash

# FFmpegのダウンロードURL
FFMPEG_URL="https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2024-03-05-12-49/ffmpeg-N-113973-gfed46d7706-win64-gpl.zip"

# ダウンロードと展開先のディレクトリ
DOWNLOAD_DIR="./src/bin/ffmpeg"
ZIP_FILE="ffmpeg.zip"

# 必要なディレクトリがなければ作成
mkdir -p "$DOWNLOAD_DIR"

# FFmpegをダウンロード
curl -L "$FFMPEG_URL" -o "$DOWNLOAD_DIR/$ZIP_FILE"

# 展開する
powershell.exe -Command "& {Expand-Archive -Path '$DOWNLOAD_DIR/$ZIP_FILE' -DestinationPath '$DOWNLOAD_DIR'; Remove-Item -Path '$DOWNLOAD_DIR/$ZIP_FILE'}"

# 展開後のフォルダ名を取得
EXTRACTED_FOLDER=$(ls "$DOWNLOAD_DIR" | grep 'ffmpeg-N' | head -n 1)

# 展開したファイルを適切な場所に移動し、不要なファイルを削除
mv "$DOWNLOAD_DIR/$EXTRACTED_FOLDER/bin/"* "$DOWNLOAD_DIR/"
rm -rf "$DOWNLOAD_DIR/$EXTRACTED_FOLDER"

echo "FFmpeg has been downloaded, extracted, and cleaned up in $DOWNLOAD_DIR"

