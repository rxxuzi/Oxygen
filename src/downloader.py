import yt_dlp
from path import ffmpeg_path, output_path


def download_video(url, quality, output_filename=None, output_dir=output_path, ):
    format_option = 'bestvideo+bestaudio/best'
    if quality == 1:
        format_option = 'bestvideo[height<=720]+bestaudio/best[height<=720]'
    elif quality == 2:
        format_option = 'bestvideo[height<=480]+bestaudio/best[height<=480]'
    elif quality == 3:
        format_option = 'worst'

    if output_filename:
        outtmpl = f'{output_dir}/{output_filename}.mp4'
    else:
        outtmpl = f'{output_dir}/%(title)s.%(ext)s.mp4'

    ydl_opts = {
        'format': format_option,
        'outtmpl': outtmpl,
        'ffmpeg_location': ffmpeg_path,  # `ffmpeg`のパスを指定
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.download([url])

            print("Download is complete.")

        except Exception as e:
            print(f"An error occurred during download: {e}")


def download_audio(url, output_filename=None, output_dir=output_path, ):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_dir}/{output_filename if output_filename else "%(title)s"}',
        'ffmpeg_location': ffmpeg_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.download([url])
            print("Download is complete.")
        except Exception as e:
            print(f"An error occurred during download: {e}")
