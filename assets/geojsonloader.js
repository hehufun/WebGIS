document.addEventListener("DOMContentLoaded", function () {
  // 检查map和L是否存在
  if (typeof L === "undefined" || typeof map === "undefined") {
    alert("依赖库加载失败，请检查脚本是否正常执行！");
    return;
  }

  // ========== 新增：防抖函数 + 全局缩放锁 ==========
  // 防抖函数：避免短时间内多次触发缩放
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 缩放锁：防止同时触发多个fitBounds
  let isMapZooming = false;
  // 优化后的地图缩放方法
  const optimizedFitBounds = debounce(function (bounds, options) {
    if (isMapZooming || !bounds) return;

    isMapZooming = true;
    // 执行缩放，完成后释放锁
    map.fitBounds(bounds, {
      ...options,
      animate: false,
      // 统一合理的动画时长（200ms），避免过短/过长
      duration: 200,
      // 限制最大缩放级别，避免缩放到极端层级
      maxZoom: 18,
    });

    // 动画结束后释放锁（加一点缓冲）
    setTimeout(() => {
      isMapZooming = false;
    }, options.duration || 200);
  }, 100); // 100ms防抖，避免连续触发

  // ========== 面板交互逻辑（保留不变） ==========
  const layerTrigger = document.getElementById("layerTrigger");
  const layerPanel = document.getElementById("layerPanel");

  if (layerTrigger && layerPanel) {
    layerTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      layerPanel.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (
        layerPanel.classList.contains("active") &&
        !layerPanel.contains(e.target) &&
        !layerTrigger.contains(e.target)
      ) {
        layerPanel.classList.remove("active");
      }
    });

    layerPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // ========== 原有GeoJSON配置项（保留） ==========
  const geoJsonLayers = [
    { name: "岸线变化", file: "岸线变化.geojson" },
    { name: "项目", file: "项目.geojson" },
    { name: "苍南", file: "苍南.geojson" },
    { name: "洞头", file: "洞头.geojson" },
    { name: "经开区", file: "经开区.geojson" },
    { name: "乐清", file: "乐清.geojson" },
    { name: "龙港", file: "龙港.geojson" },
    { name: "龙湾", file: "龙湾.geojson" },
    { name: "瓯江口", file: "瓯江口.geojson" },
    { name: "平阳", file: "平阳.geojson" },
    { name: "瑞安", file: "瑞安.geojson" },
  ];
  const geoJsonBasePath = "./assets/geojson/";
  const layerCache = {};

  /**
   * 生成图层开关DOM（保留）
   */
  function generateLayerItems() {
    const container = document.getElementById("layerItemsContainer");
    geoJsonLayers.forEach((layerConfig, index) => {
      const checkboxId = `layer_${index}`;
      const fullPath = `${geoJsonBasePath}${layerConfig.file}`;

      const layerItem = document.createElement("div");
      layerItem.className = "layer-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.value = fullPath;
      checkbox.dataset.layerName = layerConfig.name;

      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.textContent = layerConfig.name;

      layerItem.appendChild(checkbox);
      layerItem.appendChild(label);
      container.appendChild(layerItem);
    });
  }

  /**
   * GeoJSON样式配置（保留）
   */
  function getGeoJsonStyle(feature) {
    switch (feature.geometry.type) {
      case "Point":
        return {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        };
      case "LineString":
        return { color: "#ff0000", weight: 3, opacity: 0.8 };
      case "Polygon":
        return {
          fillColor: "#00ff00",
          weight: 2,
          opacity: 1,
          color: "#000",
          fillOpacity: 0.3,
        };
    }
  }

  /**
   * 绑定要素弹窗和点击事件（修复缩放逻辑）
   */
  function onEachFeature(feature, layer) {
    if (feature.properties) {
      const popupContent = `
            <div style="font-size:14px; line-height:1.6;">
              <p><strong>OBJECTID：</strong>${feature.properties.OBJECTID || "无"}</p>
              <p><strong>项目编号：</strong>${feature.properties.项目编号 || "无"}</p>
            </div>
          `;
      layer.bindPopup(popupContent);
    }

    // 修复：使用防抖后的缩放方法，避免快速点击卡顿
    layer.on("click", () => {
      optimizedFitBounds(layer.getBounds(), {
        padding: [16, 16],
        animate: true,
      });
    });
  }

  /**
   * 加载GeoJSON图层（修复缩放逻辑）
   */
  function loadGeoJSONLayer(filePath, checkboxId) {
    if (layerCache[checkboxId]) {
      layerCache[checkboxId].addTo(map);
      // 修复1：使用优化后的缩放方法
      optimizedFitBounds(layerCache[checkboxId].getBounds(), {
        padding: [50, 50],
        animate: true,
      });
      return;
    }

    fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error(`加载${filePath}失败`);
        return response.json();
      })
      .then((data) => {
        const geoJsonLayer = L.geoJSON(data, {
          style: getGeoJsonStyle,
          onEachFeature: onEachFeature,
          pointToLayer: (feature, latlng) => L.circleMarker(latlng),
        }).addTo(map);

        layerCache[checkboxId] = geoJsonLayer;

        // 修复2：使用优化后的缩放方法
        optimizedFitBounds(geoJsonLayer.getBounds(), {
          padding: [6, 6],
          animate: true,
        });
      })
      .catch((error) => {
        console.error("GeoJSON加载失败：", error);
        alert(`图层加载失败：${filePath}`);
        document.getElementById(checkboxId).checked = false;
        // 释放缩放锁，避免异常导致锁死
        isMapZooming = false;
      });
  }

  /**
   * 移除GeoJSON图层（保留）
   */
  function removeGeoJSONLayer(checkboxId) {
    if (layerCache[checkboxId]) {
      map.removeLayer(layerCache[checkboxId]);
    }
  }

  /**
   * 绑定图层开关事件（保留）
   */
  function bindLayerEvents() {
    document
      .querySelectorAll('.layer-item input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          const filePath = this.value;
          const checkboxId = this.id;
          this.checked
            ? loadGeoJSONLayer(filePath, checkboxId)
            : removeGeoJSONLayer(checkboxId);
        });
      });
  }

  // 初始化GeoJSON相关逻辑（保留）
  function initGeoJsonLayer() {
    generateLayerItems();
    bindLayerEvents();
  }

  // 页面加载完成后执行（保留）
  window.addEventListener("load", initGeoJsonLayer);
});
