import argparse
import sys
import validators
from downloader import download_video, download_audio


def main():
    parser = argparse.ArgumentParser(description='Download videos or audio from YouTube.')
    parser.add_argument('url', type=str, help='The URL of the video to download.')
    parser.add_argument('output', nargs='?', default=None, help='The output filename (optional).')
    parser.add_argument('-a', '--audio', action='store_true', help='Download audio only.')
    parser.add_argument('-v', '--video', action='store_true', help='Download video. This is the default action.')

    args = parser.parse_args()

    # Validate URL
    if not validators.url(args.url):
        print("The provided URL is not valid.")
        sys.exit(2)

    if not args.audio and not args.video:
        print("You must specify either video or audio download.")
        sys.exit(3)

    try:
        if args.audio:
            download_audio(args.url, args.output)
        else:
            download_video(args.url, args.output)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
