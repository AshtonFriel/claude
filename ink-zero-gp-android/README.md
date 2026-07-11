# INK-ZERO GP — Android

Native Android wrapper for [`../ink-zero-gp`](../ink-zero-gp): a fullscreen
landscape WebView that ships the game inside the APK (no network needed).
The game's touch controls kick in automatically on screen touch.

## Build

Requirements: JDK 17+, Android SDK (platform 35, build-tools 35), Gradle 8.9+.

```sh
# point the build at your SDK (or set sdk.dir in local.properties)
export ANDROID_HOME=/path/to/android-sdk
gradle assembleDebug
```

APK lands in `app/build/outputs/apk/debug/app-debug.apk`.

## Install

```sh
adb install app/build/outputs/apk/debug/app-debug.apk
```

or copy the APK to the phone and open it (you'll need to allow installs
from unknown sources, since it's a debug-signed build).

## Notes

- The game file is copied from `../ink-zero-gp/index.html` into
  `app/src/main/assets/` automatically on every build (`syncGameAsset` task),
  so edits to the game only require a rebuild — no manual copying.
- `minSdk 24` (Android 7.0+), `targetSdk 35`, landscape-locked, immersive
  fullscreen, keeps the screen on while racing.
- Pure `android.app.Activity` + `WebView`; no AndroidX, Kotlin, or any
  dependencies — the whole app is one Java file and a manifest.
