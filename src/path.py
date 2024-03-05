import os

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)

ffmpeg_path = os.path.join(parent_dir, 'src', 'bin', 'ffmpeg', 'ffmpeg.exe')
output_path = os.path.join(parent_dir, 'gen')