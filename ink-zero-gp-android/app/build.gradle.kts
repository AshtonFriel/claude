plugins {
    id("com.android.application")
}

android {
    namespace = "dev.inkzero.gp"
    compileSdk = 35

    defaultConfig {
        applicationId = "dev.inkzero.gp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

// The game lives in ../ink-zero-gp/index.html at the repo root; copy it into
// assets on every build so the APK always ships the current version.
val syncGameAsset by tasks.registering(Copy::class) {
    from(rootProject.layout.projectDirectory.file("../ink-zero-gp/index.html"))
    into(layout.projectDirectory.dir("src/main/assets"))
}
tasks.named("preBuild") {
    dependsOn(syncGameAsset)
}
