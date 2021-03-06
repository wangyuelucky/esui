/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 复选框
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('./lib');
        var InputControl = require('./InputControl');

        /**
         * 同步选中状态
         *
         * @param {Event} e DOM事件对象
         */
        function syncChecked(e) {
            var checked = lib.g(this.boxId).checked;
            this.setProperties({ checked: checked });
        }

        /**
         * 复选框控件
         * 
         * @param {Object} options 控件初始化参数
         */
        function CheckBox( options ) {
            InputControl.apply( this, arguments );
        }

        CheckBox.prototype = {
            type: 'CheckBox',

            /**
             * 创建控件主元素
             *
             * @protected
             * @return {HTMLInputElement}
             */
            createMain: function () {
                return document.createElement('label');
            },

            /**
             * 获取控件的分类
             *
             * @return {string}
             */
            getCategory: function () {
                return 'check';
            },

            initOptions: function (options) {
                var properties = {
                    value: 'on',
                    checked: false
                };

                u.extend(properties, options);

                properties.name = 
                    properties.name || this.main.getAttribute('name');

                // 初始可以有一个`datasource`，用来判断一开始是否选中，
                // 这个属性只能用一次，且不会保存下来
                // 
                // `datasource`可以是以下类型：
                // 
                // - 数组：此时只要`rawValue`在`datasource`中（弱等比较）则选上
                // - 其它：只要`rawValue`与此相等（弱等比较）则选上
                var datasource = properties.datasource;
                delete properties.datasource;

                // 这里涉及到`value`和`rawValue`的优先级问题，
                // 而这个处理在`InputControl.prototype.setProperties`里，
                // 因此要先用一下，然后再管`datasource`
                this.setProperties(properties);
                if (datasource != null) {
                    if (u.isArray(datasource)) {
                        this.checked = u.any(
                            datasource,
                            function (item) {
                                return item.value == this.value;
                            },
                            this
                        );
                    }
                    else if (this.rawValue == datasource) {
                        this.checked = true;
                    }
                }

                if (!this.title) {
                    this.title = this.main.title
                        || (this.getValue() === 'on' ? '' : this.getValue());
                }
            },
            
            /**
             * 渲染控件
             *
             * @public
             */
            initStructure: function () {
                // 如果用的是一个`<input>`，替换成`<div>`
                if (this.main.nodeName.toLowerCase() === 'input') {
                    this.boxId = this.main.id || this.helper.getId('box');
                    this.helper.replaceMain();
                    this.main.id = this.helper.getId();
                }
                else {
                    this.boxId = this.helper.getId('box');
                }

                var html = '<input type="checkbox" name="${name}" id="${id}" />'
                    + '<span id="${textId}"></span>';
                this.main.innerHTML = lib.format(
                    html,
                    {
                        name: this.name,
                        id: this.boxId,
                        textId: this.helper.getId('text')
                    }
                );

                var box = lib.g(this.boxId);
                this.helper.addDOMEvent(
                    box, 
                    'click', 
                    function (e) {
                        this.fire('click');
                        if (!box.addEventListener) {
                            syncChecked.call(e);
                        }
                    }
                );

                if (box.addEventListener) {
                    this.helper.addDOMEvent(box, 'change', syncChecked);
                }
            },

            setProperties: function (properties) {
                var changes = 
                    InputControl.prototype.setProperties.apply(this, arguments);
                if (changes.hasOwnProperty('checked')) {
                    this.fire('change');
                }
            },

            getFocusTarget: function () {
                var box = lib.g(this.boxId);
                return box;
            },

            updateTitle: function (title) {
                var title = this.title 
                    || this.main.title 
                    || (this.getValue() === 'on' ? '' : this.getValue());
                title = u.escape(title);
                this.helper.getPart('text').innerHTML = title;
                lib.setAttribute(this.boxId, 'title', title);
            },

            repaint: require('./painters').createRepaint(
                InputControl.prototype.repaint,
                {
                    name: ['rawValue', 'checked'],
                    paint: function (box, rawValue, checked) {
                        var value = box.stringifyValue(rawValue);
                        var box = lib.g(box.boxId);
                        box.value = value;
                        box.checked = checked;
                    }
                },
                {
                    name: ['disabled', 'readOnly'],
                    paint: function (box, disabled, readOnly) {
                        var box = lib.g(box.boxId);
                        box.disabled = disabled;
                        box.readOnly = readOnly;
                    }
                },
                {
                    name: 'title',
                    paint: function (box, title) {
                        box.updateTitle(title);
                    }
                }
            ),

            /**
             * 设置选中状态
             * 
             * @public
             * @param {boolean} checked 状态
             */
            setChecked: function ( checked ) {
                this.setProperties({ checked: checked });
            },
            
            /**
             * 获取选中状态
             * 
             * @public
             * @return {boolean}
             */
            isChecked: function () {
                if (this.helper.isInStage('RENDERED')) {
                    var box = lib.g(this.boxId);
                    return box.checked;
                }
                else {
                    return this.checked;
                }
            }
        };

        lib.inherits( CheckBox, InputControl );
        require('./main').register(CheckBox);
        return CheckBox;
    }
);
