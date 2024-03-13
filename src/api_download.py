import argparse
import sys
import validators
from downloader import download_video, download_audio
from concurrent.futures import ThreadPoolExecutor
from path import output_path

default_quality = 0


def main():
    parser = argparse.ArgumentParser(description='Download videos or audio from multiple URLs in parallel.')
    parser.add_argument('urls', nargs='+', type=str, help='The URLs of the videos to download.')
    parser.add_argument('-a', '--audio', action='store_true', help='Download audio only.')
    parser.add_argument('-v', '--video', action='store_true', help='Download video. This is the default action.')

    args = parser.parse_args()

    # Validate URLs
    invalid_urls = [url for url in args.urls if not validators.url(url)]
    if invalid_urls:
        print(f"The following URLs are not valid: {', '.join(invalid_urls)}")
        sys.exit(2)

    if not args.audio and not args.video:
        print("You must specify either video or audio download.")
        sys.exit(3)

    # Download in parallel
    with ThreadPoolExecutor() as executor:
        futures = []
        if args.audio:
            for url in args.urls:
                futures.append(executor.submit(download_audio, url, None, output_path))
        elif args.video:
            for url in args.urls:
                futures.append(executor.submit(download_video, url, default_quality, None, output_path))

    # Collect results from all futures
    results = [future.result() for future in futures]

    # Calculate the sum of the values in the `result` key
    sum_result: int = sum(result['result'] for result in results)

    # Compile the values (file names) of the output key into a list
    output_files = [result['output'] for result in results if result['result'] == 0]

    print("Successfully downloaded files:")
    for output_file in output_files:
        print(output_file)

    sys.exit(sum_result)


if __name__ == '__main__':
    main()
