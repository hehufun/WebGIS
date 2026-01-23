(function (L) {
    if (!L) {
        throw new Error('Leaflet is not loaded');
    }

    /**
     * 自定义经纬度显示插件（PC跟随鼠标/移动端显示地图中心）
     * @param {Object} options 配置项
     * @param {String} options.position 插件控件位置
     * @param {String} options.format 显示格式，支持 {lat}、{lng} 占位符
     * @param {String} options.className 自定义CSS类名
     * @param {Number} options.precision 经纬度小数精度
     */
    L.Control.MousePosition = L.Control.extend({
        options: {
            position: 'bottomright',
            format: '纬度: {lat}, 经度: {lng}',
            className: 'leaflet-mouse-position',
            precision: 6
        },

        // 初始化控件
        onAdd: function (map) {
            this._map = map;
            // 1. 检测设备类型（是否为移动端）
            this._isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // 2. 创建显示容器
            this._container = L.DomUtil.create('div', this.options.className);
            L.DomUtil.addClass(this._container, 'leaflet-bar');
            L.DomUtil.addClass(this._container, 'leaflet-control');
            L.DomEvent.disableClickPropagation(this._container);

            // 3. 根据设备类型绑定不同事件
            this._bindEvents();

            // 4. 初始化显示（移动端直接显示中心坐标）
            this._updateText('---, ---');
            if (this._isMobile) {
                this._updateCenterPosition();
            }

            return this._container;
        },

        // 移除控件时清理事件
        onRemove: function (map) {
            this._unbindEvents();
        },

        // 绑定事件（区分PC/移动端）
        _bindEvents: function () {
            const map = this._map;
            if (this._isMobile) {
                // 移动端：地图拖动、缩放、加载完成时更新中心坐标
                L.DomEvent.on(map, 'move', this._updateCenterPosition, this);
                L.DomEvent.on(map, 'zoom', this._updateCenterPosition, this);
                L.DomEvent.on(map, 'load', this._updateCenterPosition, this);
            } else {
                // PC端：鼠标移动时更新坐标
                L.DomEvent.on(map, 'mousemove', this._onMouseMove, this);
            }
        },

        // 解绑事件
        _unbindEvents: function () {
            const map = this._map;
            if (this._isMobile) {
                L.DomEvent.off(map, 'move', this._updateCenterPosition, this);
                L.DomEvent.off(map, 'zoom', this._updateCenterPosition, this);
                L.DomEvent.off(map, 'load', this._updateCenterPosition, this);
            } else {
                L.DomEvent.off(map, 'mousemove', this._onMouseMove, this);
            }
        },

        // PC端：鼠标移动事件处理
        _onMouseMove: function (e) {
            this._updatePosition(e.latlng);
        },

        // 移动端：更新地图中心坐标
        _updateCenterPosition: function () {
            // 获取地图当前视图中心的经纬度
            const centerLatLng = this._map.getCenter();
            this._updatePosition(centerLatLng);
        },

        // 统一更新经纬度显示
        _updatePosition: function (latlng) {
            if (!latlng) return;
            const lat = latlng.lat.toFixed(this.options.precision);
            const lng = latlng.lng.toFixed(this.options.precision);
            const text = this.options.format.replace('{lat}', lat).replace('{lng}', lng);
            this._updateText(text);
        },

        // 更新显示文本
        _updateText: function (text) {
            this._container.innerHTML = text;
        }
    });

    // 暴露全局方法
    L.control.mousePosition = function (options) {
        return new L.Control.MousePosition(options);
    };

})(window.L);