# Oxygen

A powerful and user-friendly video downloader built with Electron, TypeScript, and React.

## Features

- **Download Videos and Audio**: Download videos in various formats or extract audio only
- **Multiple Format Support**: MP4, MOV, WebM for video; MP3, WAV, AAC for audio
- **Quality Selection**: Choose from Best, High (1080p), Medium (720p), Low (480p), or Worst quality
- **Authentication Support**: Use cookies or credentials for private videos
- **Proxy Support**: Configure proxy servers for downloads
- **Download Management**: Progress tracking, concurrent downloads, and retry mechanisms
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Windows 10 or later (for Windows builds)

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rxxuzi/oxygen.git
   cd oxygen
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Download yt-dlp and FFmpeg binaries**:
   - Download yt-dlp.exe from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
   - Download FFmpeg from [FFmpeg official site](https://ffmpeg.org/download.html)
   - Place both executables in `resources/binaries/win32/`

## Development

Run the app in development mode:

```bash
npm run dev
```

This will start both the main process and renderer process with hot reloading.

## Building

### Build for Windows

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Create Windows installer**:
   ```bash
   npm run dist:win
   ```

3. **Create portable version**:
   ```bash
   npm run dist:portable
   ```

The built files will be in the `out` directory:
- `Oxygen-Setup-1.0.0.exe` - NSIS installer
- `Oxygen-Portable-1.0.0.exe` - Portable executable
- `Oxygen-1.0.0-win.zip` - ZIP archive

### Build for other platforms

For macOS:
```bash
npm run dist -- --mac
```

For Linux:
```bash
npm run dist -- --linux
```

## Configuration

The app stores its configuration and data in:
- Windows: `%APPDATA%/oxygen/`
- macOS: `~/Library/Application Support/oxygen/`
- Linux: `~/.config/oxygen/`

## Troubleshooting

### FFmpeg not found
Make sure FFmpeg is in the `resources/binaries/win32/` directory and has execute permissions.

### Download fails
- Check if the URL is valid
- Ensure you have internet connection
- Try updating yt-dlp to the latest version
- Check if authentication is required for the video

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The download engine
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety