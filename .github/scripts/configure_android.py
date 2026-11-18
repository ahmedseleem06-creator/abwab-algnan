import os
import re

def update_manifest():
    manifest_path = "android/app/src/main/AndroidManifest.xml"
    if not os.path.exists(manifest_path):
        print(f"Manifest not found at {manifest_path}")
        return

    with open(manifest_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Permissions to add
    permissions = (
        '    <uses-permission android:name="android.permission.INTERNET"/>\n'
        '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>\n'
        '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n'
        '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>\n'
    )

    if "android.permission.INTERNET" not in content:
        content = content.replace("<application", permissions + "    <application")

    if 'android:usesCleartextTraffic' not in content:
        content = content.replace('<application', '<application\n        android:usesCleartextTraffic="true"')

    content = content.replace('android:label="abwab_aljinan"', 'android:label="أبواب الجنان"')

    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ AndroidManifest.xml configured successfully.")

def update_gradle():
    gradle_files = [
        "android/app/build.gradle",
        "android/app/build.gradle.kts"
    ]
    for gf in gradle_files:
        if not os.path.exists(gf):
            continue
        with open(gf, "r", encoding="utf-8") as f:
            content = f.read()

        # Update minSdkVersion / minSdk to 21
        content = re.sub(r'minSdkVersion\s+.*', 'minSdkVersion 21', content)
        content = re.sub(r'minSdk\s*=\s*.*', 'minSdk = 21', content)

        # Update compileSdk / compileSdkVersion to at least 34 if needed
        content = re.sub(r'compileSdk\s*=\s*flutter\.compileSdkVersion', 'compileSdk = 34', content)
        content = re.sub(r'compileSdkVersion\s+flutter\.compileSdkVersion', 'compileSdkVersion 34', content)

        with open(gf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ {gf} configured successfully.")

if __name__ == "__main__":
    update_manifest()
    update_gradle()
