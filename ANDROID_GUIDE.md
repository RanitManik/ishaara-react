# Android Integration Guide: Embedding the React App

This guide explains how to embed your Vite/React application into an Android app using a local server approach. This ensures that features like `fetch()`, 3D model loading (`.glb`), and routing work correctly by avoiding the limitations of the `file://` protocol.

## Prerequisites

The `dist` folder in this repository is tracked and contains the latest production build ready for deployment.

1.  **Get the Build Files**:
    - **Option A (Recommended)**: Use the files directly from the `dist` folder in this repository.
    - **Option B (Manual Build)**: If you have modified the React code, run `npm run build` to update the `dist` folder.

## Approach: Using a Local Internal Server (NanoHTTPD)

Running a lightweight HTTP server inside the Android app allows the WebView to treat your app as if it's running on a real website (`http://localhost:8080`). This resolves CORS issues and path resolution errors.

### Step 1: Android Project Setup

1.  **Create Assets Folder**:
    In your Android project, go to `app/src/main/assets`.
    Create a subfolder named `www`.

2.  **Copy Files**:
    Copy **everything** from the `dist` folder (located in the root of this repository) into `app/src/main/assets/www` in your Android project.

    Structure should look like:

    ```text
    app/src/main/assets/www/
    ├── index.html
    ├── ybot.glb
    └── assets/
        ├── index-xxxxx.js
        └── index-xxxxx.css
    ```

### Step 2: Add Dependencies

Add `NanoHTTPD` to your `app/build.gradle` file. This is a tiny web server library.

```gradle
dependencies {
    implementation 'org.nanohttpd:nanohttpd:2.3.1'
    // ... other dependencies
}
```

### Step 3: Create the Local Server Class

Create a Kotlin class `LocalWebServer.kt` to handle serving files from the `assets` folder.

```kotlin
import android.content.Context
import android.content.res.AssetManager
import fi.iki.elonen.NanoHTTPD
import java.io.IOException
import java.io.InputStream

class LocalWebServer(private val context: Context, port: Int = 8080) : NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        var uri = session.uri

        // Default to index.html
        if (uri == "/" || uri.isEmpty()) {
            uri = "/index.html"
        }

        return try {
            // Remove leading slash for asset manager
            val assetPath = "www" + uri

            // Try to open the file from assets
            val mimeType = getMimeTypeForFile(uri)
            val inputStream: InputStream = context.assets.open(assetPath)

            newChunkedResponse(Response.Status.OK, mimeType, inputStream)
        } catch (e: IOException) {
            // If file not found, it might be a client-side route.
            // For SPAs, usually fallback to index.html, but for assets return 404.
            if (uri.contains(".")) {
                newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "File not found")
            } else {
                // Fallback to index.html for SPA routing
                try {
                    val indexStream = context.assets.open("www/index.html")
                    newChunkedResponse(Response.Status.OK, "text/html", indexStream)
                } catch (e2: IOException) {
                    newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "Internal Error")
                }
            }
        }
    }

    private fun getMimeTypeForFile(uri: String): String {
        return when {
            uri.endsWith(".html") -> "text/html"
            uri.endsWith(".css") -> "text/css"
            uri.endsWith(".js") -> "application/javascript"
            uri.endsWith(".json") -> "application/json"
            uri.endsWith(".png") -> "image/png"
            uri.endsWith(".jpg") -> "image/jpeg"
            uri.endsWith(".glb") -> "model/gltf-binary" // Important for your 3D model
            uri.endsWith(".svg") -> "image/svg+xml"
            else -> "application/octet-stream"
        }
    }
}
```

### Step 4: Implement the Activity/Fragment

In your `ConvertActivity` or `Fragment`, start the server and load the URL.

```kotlin
import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class ConvertActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var localServer: LocalWebServer? = null
    private val PORT = 8080

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_convert)

        webView = findViewById(R.id.webView)

        // 1. Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            // Allow mixed content if needed (usually not for localhost)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Ensure links open in the WebView, not external browser
        webView.webViewClient = WebViewClient()

        // Handle permission requests (Microphone)
        webView.webChromeClient = object : android.webkit.WebChromeClient() {
            override fun onPermissionRequest(request: android.webkit.PermissionRequest) {
                request.grant(request.resources)
            }
        }

        // 2. Start Server
        startServer()

        // 3. Load the Local URL
        // Note: 10.0.2.2 is localhost for Android Emulator, but since we run the server
        // ON the device, we use localhost or 127.0.0.1
        webView.loadUrl("http://localhost:$PORT/index.html")
    }

    private fun startServer() {
        try {
            if (localServer == null) {
                localServer = LocalWebServer(this, PORT)
                localServer?.start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        localServer?.stop()
    }
}
```

### Step 5: Android Manifest Permissions

Ensure you have internet permission (required for socket connections, even local ones) and allow cleartext traffic (since we are using `http://` not `https://`).

In `AndroidManifest.xml`:

```xml
<manifest ...>
    <!-- Required for Local Server -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- Required for Microphone Access -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        ...
        android:usesCleartextTraffic="true">
        <!-- usesCleartextTraffic is needed for http://localhost -->

        <activity android:name=".ConvertActivity" ... />
    </application>
</manifest>
```

## App Structure & Navigation

The application provides two distinct screens accessible via specific URLs. Since there is no in-app navigation bar, the Android app must load the appropriate URL for each screen.

### 1. Convert Screen (Default)

- **URL**: `http://localhost:8080/index.html#/`
- **Purpose**: Speech-to-Sign and Text-to-Sign conversion.

### 2. Learn Screen

- **URL**: `http://localhost:8080/index.html#/learn`
- **Purpose**: Interactive alphabet learning with the 3D avatar.

### Android Implementation Example

To switch between screens, simply load the corresponding URL in your WebView:

```kotlin
// Load Convert Screen
webView.loadUrl("http://localhost:8080/index.html#/")

// Load Learn Screen
webView.loadUrl("http://localhost:8080/index.html#/learn")
```

## Troubleshooting

- **White Screen?**
    - Check Logcat for WebView errors.
    - Ensure `javaScriptEnabled = true`.
    - Verify the files are actually in `src/main/assets/www`.
- **3D Model Not Loading (404)?**
    - Ensure `ybot.glb` is in `src/main/assets/www/`.
    - Ensure the `LocalWebServer` class has the correct MIME type for `.glb` (`model/gltf-binary`).
- **Port in Use?**
    - If port 8080 is taken, try 8081 or another high port.

## Alternative: WebViewAssetLoader (Google Recommended)

If you prefer not to manage a socket server, you can use `WebViewAssetLoader`. It intercepts requests to a virtual domain (e.g., `https://appassets.androidplatform.net`) and serves files from assets.

**Pros**: No port conflicts, secure (HTTPS), no background thread management.
**Cons**: Slightly more complex setup for some specific fetch scenarios, but generally robust.

If the Local Server approach works for you, it is often the most "drop-in" replacement for a standard web environment.
