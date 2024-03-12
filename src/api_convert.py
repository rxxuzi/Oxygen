import os
import sys
import subprocess
from path import output_path, ffmpeg_path


def convert_video_to_audio(video_file_path):
    file_name_with_ext = os.path.basename(video_file_path)
    file_name, file_ext = os.path.splitext(file_name_with_ext)

    audio_file_path = os.path.join(output_path, file_name + '.mp3')

    command = f'{ffmpeg_path} -i "{video_file_path}" -b:a 192K -vn -loglevel error "{audio_file_path}"'

    try:
        subprocess.call(command, shell=True)
        print(f'Audio file successfully created.: {audio_file_path}')
    except Exception as e:
        print(f'Error : {e}')


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python api_convert.py <video path>.")
    else:
        video_file_path = sys.argv[1]
        convert_video_to_audio(video_file_path)
