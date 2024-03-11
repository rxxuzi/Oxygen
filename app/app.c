// gcc app.c -o oxygen -lgdi32

#include <windows.h>
#include <stdlib.h>
#include <stdio.h>

#define ID_BUTTON_EXECUTE 1
#define ID_EDIT_URL 2
#define ID_RADIO_AUDIO 3
#define ID_RADIO_VIDEO 4
#define API_PATH "src/api.py"

HBITMAP hImage;
LRESULT CALLBACK WindowProcedure(HWND, UINT, WPARAM, LPARAM);

void AddControls(HWND);

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrevInst, LPSTR args, int ncmdshow) {
    WNDCLASSW wc = {0};

    wc.hbrBackground = (HBRUSH)COLOR_WINDOW;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hInstance = hInst;
    wc.lpszClassName = L"myWindowClass";
    wc.lpfnWndProc = WindowProcedure;

    if (!RegisterClassW(&wc)) return -1;

    CreateWindowW(L"myWindowClass", L"Oxygen", WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX | WS_VISIBLE, CW_USEDEFAULT, CW_USEDEFAULT, 720, 360,  NULL, NULL, hInst, NULL);

    MSG msg = {0};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

LRESULT CALLBACK WindowProcedure(HWND hWnd, UINT msg, WPARAM wp, LPARAM lp) {
    static HWND hEdit, hRadioAudio, hRadioVideo;
    char url[2048], command[2048];
    BOOL bAudioSelected;

    switch (msg) {
        case WM_GETMINMAXINFO: {
            MINMAXINFO* mmi = (MINMAXINFO*)lp;
            mmi->ptMinTrackSize.x = 720;
            mmi->ptMinTrackSize.y = 360;
            mmi->ptMaxTrackSize.x = 720;
            mmi->ptMaxTrackSize.y = 360;
            return 0;
        }

        case WM_CREATE:
            AddControls(hWnd);
            hEdit = GetDlgItem(hWnd, ID_EDIT_URL);
            hRadioAudio = GetDlgItem(hWnd, ID_RADIO_AUDIO);
            hRadioVideo = GetDlgItem(hWnd, ID_RADIO_VIDEO);
            break;
        case WM_COMMAND:
            switch (wp) {
                case ID_BUTTON_EXECUTE:
                    GetWindowText(hEdit, url, 2048);
                    bAudioSelected = (BOOL)SendMessage(hRadioAudio, BM_GETCHECK, 0, 0);
                    sprintf(command, "python %s %s \"%s\"", API_PATH, bAudioSelected ? "-a" : "-v", url);
                    system(command);
                    break;
            }
            break;
        case WM_DESTROY:
            DeleteObject(hImage);
            PostQuitMessage(0);
            break;
        default:
            return DefWindowProcW(hWnd, msg, wp, lp);
    }
    return 0;
}

void AddControls(HWND hWnd) {
    CreateWindowW(L"Static", L"URL:", WS_VISIBLE | WS_CHILD, 20, 20, 40, 20, hWnd, NULL, NULL, NULL);
    CreateWindowW(L"Button", L"Save", WS_VISIBLE | WS_CHILD, 20, 90, 80, 25, hWnd, (HMENU)ID_BUTTON_EXECUTE, NULL, NULL);
    CreateWindowW(L"Edit", L"", WS_VISIBLE | WS_CHILD | WS_BORDER, 60, 20, 400, 20, hWnd, (HMENU)ID_EDIT_URL, NULL, NULL);
    CreateWindowW(L"Button", L"Audio", WS_VISIBLE | WS_CHILD | BS_AUTORADIOBUTTON, 20, 50, 100, 30, hWnd, (HMENU)ID_RADIO_AUDIO, NULL, NULL);
    HWND hVideoBtn = CreateWindowW(L"Button", L"Video", WS_VISIBLE | WS_CHILD | BS_AUTORADIOBUTTON | WS_GROUP | WS_TABSTOP, 130, 50, 100, 30, hWnd, (HMENU)ID_RADIO_VIDEO, NULL, NULL);
    // ビデオボタンをデフォルトで選択状態にする
    SendMessage(hVideoBtn, BM_SETCHECK, BST_CHECKED, 0);
}

