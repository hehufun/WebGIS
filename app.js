// ===================== 第一部分：动态生成Manifest（优先执行） =====================
(function initDynamicManifest() {
  // 等待DOM加载完成后再执行（避免找不到#static-manifest元素）
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", generateManifest);
  } else {
    generateManifest();
  }

  // 封装manifest生成核心逻辑
  function generateManifest() {
    // 1. 检查是否存在静态manifest元素（没有则直接退出）
    const staticLink = document.getElementById("static-manifest");
    if (!staticLink) {
      console.warn("未找到静态manifest元素，跳过动态生成");
      return;
    }

    // 2. 兼容性检测
    if (!window.Blob || !window.URL?.createObjectURL) {
      console.warn("浏览器不支持动态manifest，使用静态配置");
      return;
    }

    try {
      // 封装获取完整基础URL的函数
      const fullBaseUrl = getFullBaseUrl();

      // 构建manifest配置
      const manifestContent = {
        name: "WebGIS应用",
        short_name: "WebGIS",
        start_url:
          fullBaseUrl + (fullBaseUrl.endsWith("/") ? "index.html" : ""),
        display: "standalone",
        orientation: "landscape",
        background_color: "#ffffff",
        theme_color: "#99cc99",
        description: "WebGIS地理信息应用",
        categories: ["utilities", "productivity"],
        icons: [
          {
            src: fullBaseUrl + "assets/images/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: fullBaseUrl + "assets/images/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: fullBaseUrl + "assets/images/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      };

      // 生成Blob并替换静态manifest
      const blob = new Blob([JSON.stringify(manifestContent, null, 2)], {
        type: "application/json",
      });
      const manifestUrl = URL.createObjectURL(blob);
      staticLink.href = manifestUrl;

      console.log("动态manifest生成成功", {
        fullBaseUrl: fullBaseUrl,
        manifestContent: manifestContent,
      });
    } catch (error) {
      console.error("动态manifest生成失败，使用静态配置", error);
    }
  }

  // 工具函数：获取完整基础URL
  function getFullBaseUrl() {
    try {
      const protocol = window.location.protocol;
      const host = window.location.host;
      const pathname = window.location.pathname;
      const lastSlashIndex = pathname.lastIndexOf("/");
      const basePath = pathname.substring(0, lastSlashIndex + 1);
      return protocol + "//" + host + basePath;
    } catch (error) {
      console.warn("获取完整URL失败，使用当前页面根路径", error);
      return window.location.href.substring(
        0,
        window.location.href.lastIndexOf("/") + 1,
      );
    }
  }
})();

// 检查浏览器是否支持Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        // 可选：也可以删掉这个Service Worker注册成功的日志
        // console.log('Service Worker注册成功：', registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker注册失败：", error);
      });
  });
}

// 加载GeoJSON的逻辑
async function loadGeoJSON() {
  const geojsonFiles = [
    "./assets/geojson/乐清.geojson",
    "./assets/geojson/平阳.geojson",
    "./assets/geojson/洞头.geojson",
    "./assets/geojson/瑞安.geojson",
    "./assets/geojson/瓯江口.geojson",
    "./assets/geojson/经开区.geojson",
    "./assets/geojson/苍南.geojson",
    "./assets/geojson/项目.geojson",
    "./assets/geojson/龙港.geojson",
    "./assets/geojson/龙湾.geojson",
    "./assets/geojson/岸线变化.geojson",
  ];

  try {
    for (const file of geojsonFiles) {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`加载失败：${file}，状态码：${response.status}`);
      }
      const geojson = await response.json();
      // 删掉这行加载成功的日志
      // console.log(`成功加载GeoJSON：${file}`, geojson);
      renderGeoJSON(geojson, file);
    }
    // 可选：如果想知道所有文件加载完成，只打印一行极简日志
    // console.log('所有GeoJSON文件加载完成');
  } catch (error) {
    // 保留报错日志，方便排查问题
    console.error("GeoJSON加载失败：", error);
  }
}

// 渲染GeoJSON的函数
function renderGeoJSON(geojson, fileName) {
  // 删掉这行渲染开始的日志
  // console.log(`开始渲染${fileName}的数据`);
  // 你的地图渲染逻辑（比如Leaflet/Mapbox代码）
  // L.geoJSON(geojson).addTo(map);
}

// 页面加载后立即加载GeoJSON
document.addEventListener("DOMContentLoaded", loadGeoJSON);
