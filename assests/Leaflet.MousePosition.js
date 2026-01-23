(function (L) {
    if (!L) {
        throw new Error('Leaflet is not loaded');
    }

    /**
     * 自定义经纬度显示插件
     * @param {Object} options 配置项
     * @param {String} options.position 插件控件位置（如 'bottomright'、'bottomleft'）
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
            // 创建显示容器
            this._container = L.DomUtil.create('div', this.options.className);
            L.DomUtil.addClass(this._container, 'leaflet-bar');
            L.DomUtil.addClass(this._container, 'leaflet-control');
            
            // 禁止容器冒泡（避免影响地图交互）
            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.on(map, 'mousemove', this._onMouseMove, this);

            // 初始显示空值
            this._updateText('---, ---');

            return this._container;
        },

        // 移除控件时清理事件
        onRemove: function (map) {
            L.DomEvent.off(map, 'mousemove', this._onMouseMove, this);
        },

        // 鼠标移动事件处理
        _onMouseMove: function (e) {
            const lat = e.latlng.lat.toFixed(this.options.precision);
            const lng = e.latlng.lng.toFixed(this.options.precision);
            const text = this.options.format.replace('{lat}', lat).replace('{lng}', lng);
            this._updateText(text);
        },

        // 更新显示文本
        _updateText: function (text) {
            this._container.innerHTML = text;
        }
    });

    // 暴露全局方法，方便使用
    L.control.mousePosition = function (options) {
        return new L.Control.MousePosition(options);
    };

})(window.L);