import axios from "axios";
import *as app from "@tauri-apps/api/app"
import type { AxiosRequestConfig } from "axios";
function proxyURI(url: string) {
    return 'https://proxy.wanzii.cn/bili114514/' + encodeURIComponent(url)
}
async function request(config: AxiosRequestConfig) {
    try {
        return await axios({
            ...config,
            url: proxyURI(config.url as string),
        })
    } catch (e) {
        console.log('使用代理访问失败：', e)
        return await axios(config)
    }
}
async function isNewerVersion(ver: string) {
    let now = await app.getVersion();

    const nowMatch = /(\d+)\.(\d+)\.(\d+)/.exec(now) || [0, 0, 0];
    const verMatch = /(\d+)\.(\d+)\.(\d+)/.exec(ver) || [0, 0, 0];

    const nowParts = [
        Number(nowMatch[1] ?? 0),
        Number(nowMatch[2] ?? 0),
        Number(nowMatch[3] ?? 0)
    ];

    const verParts = [
        Number(verMatch[1] ?? 0),
        Number(verMatch[2] ?? 0),
        Number(verMatch[3] ?? 0)
    ];

    for (let i = 0; i < 3; i++) {
        if (verParts[i] > nowParts[i]) return true;
        if (verParts[i] < nowParts[i]) return false;
    }
    return false;
}

async function checkUpdate(): Promise<UpdateInfo> {
    let updateInfo: UpdateInfo = { hasUpdate: false, latestVersion: await app.getVersion(), assets: [] }
    try {
        let release = await request({ url: 'https://api.github.com/repos/xwzkj/cheeseschedule/releases/latest' })
        if (release.status === 200) {
            let latest = release.data.tag_name
            updateInfo.latestVersion = latest;
            updateInfo.assets = release.data.assets;
            if (await isNewerVersion(latest)) {
                updateInfo.hasUpdate = true;
            }
        } else {
            throw new Error(release.statusText)
        }
    } catch (e) {
        console.log('检查更新失败：', e)
        window.$NMessageApi.error('检查更新失败')
    }
    return updateInfo;
}

export {
    proxyURI,
    request,
    isNewerVersion,
    checkUpdate
}