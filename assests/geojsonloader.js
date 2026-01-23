document.addEventListener("DOMContentLoaded", function () {
  // 检查map和L是否存在（依赖mapbase.js的map对象）
  if (typeof L === "undefined" || typeof map === "undefined") {
    alert("依赖库加载失败，请检查脚本是否正常执行！");
    return;
  }

  // ========== 配置项 ==========
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
  const geoJsonBasePath = "./assests/geojson/";
  // 图层缓存对象
  const layerCache = {};

  /**
   * 生成图层开关DOM
   */
  function generateLayerItems() {
    const container = document.getElementById("layerItemsContainer");
    geoJsonLayers.forEach((layerConfig, index) => {
      const checkboxId = `layer_${index}`;
      const fullPath = `${geoJsonBasePath}${layerConfig.file}`;

      // 创建图层项DOM
      const layerItem = document.createElement("div");
      layerItem.className = "layer-item";

      // 复选框
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.value = fullPath;
      checkbox.dataset.layerName = layerConfig.name;

      // 标签
      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.textContent = layerConfig.name;

      // 组装
      layerItem.appendChild(checkbox);
      layerItem.appendChild(label);
      container.appendChild(layerItem);
    });
  }

  /**
   * GeoJSON样式配置
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
   * 绑定要素弹窗和点击事件
   */
  function onEachFeature(feature, layer) {
    // 弹窗内容
    if (feature.properties) {
      const popupContent = `
            <div style="font-size:14px; line-height:1.6;">
              <p><strong>OBJECTID：</strong>${feature.properties.OBJECTID || "无"}</p>
              <p><strong>项目编号：</strong>${feature.properties.项目编号 || "无"}</p>
            </div>
          `;
      layer.bindPopup(popupContent);
    }

    // 点击缩放
    layer.on("click", () => {
      map.fitBounds(layer.getBounds(), {
        padding: [16, 16],
        animate: true,
        duration: 66,
      });
    });
  }

  /**
   * 加载GeoJSON图层
   */
  function loadGeoJSONLayer(filePath, checkboxId) {
    // 已加载则直接显示并缩放
    if (layerCache[checkboxId]) {
      layerCache[checkboxId].addTo(map);
      map.fitBounds(layerCache[checkboxId].getBounds(), {
        padding: [50, 50],
        animate: true,
        duration: 800,
      });
      return;
    }

    // 加载文件
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

        // 缓存图层
        layerCache[checkboxId] = geoJsonLayer;

        // 缩放至图层范围
        map.fitBounds(geoJsonLayer.getBounds(), {
          padding: [6, 6],
          animate: true,
          duration: 666,
        });
      })
      .catch((error) => {
        console.error("GeoJSON加载失败：", error);
        alert(`图层加载失败：${filePath}`);
        document.getElementById(checkboxId).checked = false;
      });
  }

  /**
   * 移除GeoJSON图层
   */
  function removeGeoJSONLayer(checkboxId) {
    if (layerCache[checkboxId]) {
      map.removeLayer(layerCache[checkboxId]);
    }
  }

  /**
   * 绑定图层开关事件
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

  // 初始化GeoJSON相关逻辑
  function initGeoJsonLayer() {
    generateLayerItems(); // 生成开关
    bindLayerEvents(); // 绑定事件
  }

  // 页面加载完成后执行
  window.addEventListener("load", initGeoJsonLayer);
});
