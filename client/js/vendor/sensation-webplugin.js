var sensationio;
(function (sensationio) {
    var BackendConnector = (function () {
        function BackendConnector() {
            this.host = 'https://rest.sensation.io';
            this.iframeAuthentication = { initialized: false };
        }
        BackendConnector.prototype.setHost = function (host) {
            this.host = host;
        };
        BackendConnector.prototype.setKey = function (key) {
            this.key = key;
        };
        BackendConnector.prototype.setTags = function (tags) {
            this.tags = tags;
        };
        BackendConnector.prototype.authenticateApp = function (clientId, tenantId, redirectUri, callback) {
            if (this.iframeAuthentication.frame) {
                try {
                    document.body.removeChild(this.iframeAuthentication.frame);
                    this.iframeAuthentication.frame = undefined;
                }
                catch (err) {
                    console.log('[SIO]: WARN: Could not remove SIO auth components', err);
                }
            }
            if (this.iframeAuthentication.authListener) {
                try {
                    window.removeEventListener('message', this.iframeAuthentication.authListener);
                    this.iframeAuthentication.authListener = undefined;
                }
                catch (err) {
                    console.log('[SIO]: WARN: Could not remove SIO auth listener', err);
                }
            }
            this.iframeAuthentication.uri = redirectUri;
            this.createAuthorizationFrame(this.host + '/token?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&tenant=' + tenantId);
            window.addEventListener('message', function (event) {
                var data = event.data;
                console.log("got data : ", data);
                if (data && data.length > 0) {
                    var tokenIndex = data.indexOf('sio_token');
                    if (tokenIndex >= 0) {
                        var token = data.substr(tokenIndex + 10, data.length - tokenIndex);
                        callback(undefined, token);
                    }
                }
            }, false);
        };
        BackendConnector.prototype.createAuthorizationFrame = function (authUrl) {
            var _this = this;
            this.iframeAuthentication.frame = document.createElement('iframe');
            var versionPostfix = '';
            this.iframeAuthentication.frame.setAttribute('src', authUrl);
            this.iframeAuthentication.frame.setAttribute('style', 'display:none;');
            document.body.appendChild(this.iframeAuthentication.frame);
            this.iframeAuthentication.frame.onload = function () {
                _this.iframeAuthentication.initialized = true;
            };
        };
        BackendConnector.prototype.loadQuestion = function (token, pqid, callback) {
            $.ajax({
                url: this.host + '/pollquestions/' + pqid,
                type: 'GET',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                }
            }).done(function (question) {
                if (callback) {
                    callback(undefined, question);
                }
                else
                    console.error('[BACKENDCONNECTOR]: Callback was not provided');
            }).fail(function (loaderr) {
                console.log('[BACKENDCONNECTOR]: There was an error loading the poll question', loaderr);
                callback(loaderr);
            });
        };
        BackendConnector.prototype.addJam = function (token, jam, callback) {
            $.ajax({
                url: this.host + '/jams',
                type: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf8"
                },
                data: {
                    poll_question_id: jam.poll_question_id,
                    x: jam.x,
                    y: jam.y,
                    tags: this.tags,
                    key: this.key
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + token);
                }
            }).done(function (response) {
                if (callback) {
                    callback(undefined, response);
                }
                else {
                    console.log('[BACKENDCONNECTOR]: Callback was not provided');
                }
            }).fail(function (loaderr) {
                callback(loaderr);
                console.log('[BACKENDCONNECTOR]: There was an error when posting a multi jam', loaderr);
            });
        };
        return BackendConnector;
    }());
    sensationio.BackendConnector = BackendConnector;
})(sensationio || (sensationio = {}));
var sensationio;
(function (sensationio) {
    var HTMLRenderer = (function () {
        function HTMLRenderer() {
            this.configuration = {
                categories: {},
                emotionMapDimension: { x: 10, y: 10 },
                emotionMapSquareSize: 25,
                backgroundColor: { r: 255, g: 255, b: 255, a: 0.9 },
                gridMode: "dashed",
                gridColor: { r: 200, g: 200, b: 200, a: 1 },
                gridCrosshairColor: { r: 160, g: 160, b: 160, a: 1 },
                gridCrosshairMode: "line",
                readonly: false,
                submitOnClick: false
            };
            this.defaultCategoryId = "defaultCategory";
            this.defaultCategoryName = "Default Category";
            this.emotionMapElement = undefined;
            this.data = {};
            this.onConfigurationChangeCallbacks = [];
            this.onHoverCallbacks = [];
            this.onClickCallbacks = [];
            this.onSubmitCallbacks = [];
        }
        HTMLRenderer.prototype.extendConfiguration = function (configuration) {
            this.configuration = $.extend({}, this.configuration, configuration);
            if (configuration.labels)
                this.renderLabels();
            if (configuration.emotionMapSquareSize || configuration.backgroundColor || configuration.gridColor || configuration.gridMode || configuration.gridColor || configuration.gridCrosshairMode || configuration.gridCrosshairColor)
                this.initializeMap(this.configuration.targetElementId);
            this.triggerConfigurationChangeCallbacks();
        };
        HTMLRenderer.prototype.getConfiguration = function () {
            return this.configuration;
        };
        HTMLRenderer.prototype.onConfigurationChange = function (callback, triggerOnRegistration) {
            if (triggerOnRegistration === void 0) { triggerOnRegistration = true; }
            this.onConfigurationChangeCallbacks.push(callback);
            if (triggerOnRegistration)
                callback(this.configuration);
        };
        HTMLRenderer.prototype.triggerConfigurationChangeCallbacks = function () {
            var _this = this;
            $.each(this.onConfigurationChangeCallbacks, function (index, fn) {
                fn(_this.configuration);
            });
        };
        HTMLRenderer.prototype.setText = function (text, quarter, extraCssClasses) {
            var textContainerClass = "emotionmap-text-" + quarter;
            this.emotionMapElement.find("." + textContainerClass).fadeOut(function () {
                this.remove();
            });
            this.emotionMapElement.append($("<div class=\"emotionmap-text " + textContainerClass + " " + extraCssClasses + "\" style=\"width:" + (this.configuration.emotionMapDimension.x * this.configuration.emotionMapSquareSize) / 2 + "px;height:" + ((this.configuration.emotionMapDimension.y * this.configuration.emotionMapSquareSize) / 2 + 1) + "px\">" + text + "</div>").hide().fadeIn());
        };
        HTMLRenderer.prototype.clearTexts = function () {
            this.emotionMapElement.find(".emotionmap-text").fadeOut(function () {
                this.remove();
            });
        };
        HTMLRenderer.prototype.setLabels = function (top, bottom, left, right) {
            this.configuration.labels = { top: top, bottom: bottom, left: left, right: right };
            this.renderLabels();
            this.triggerConfigurationChangeCallbacks();
        };
        HTMLRenderer.prototype.addPoints = function (points) {
            var _this = this;
            $.each(points, function (index, point) {
                _this.addPoint(point);
            });
        };
        HTMLRenderer.prototype.addCategory = function (category) {
            this.configuration.categories[category.id] = category;
            this.triggerConfigurationChangeCallbacks();
        };
        HTMLRenderer.prototype.addPoint = function (pointOrCategory, x, y, value) {
            var point;
            if (typeof pointOrCategory === "string")
                point = { x: x, y: y, value: value, categoryId: pointOrCategory };
            else
                point = pointOrCategory;
            if (point.categoryId === undefined)
                point.categoryId = this.getDefaultCategory().id;
            if (this.data[point.categoryId] === undefined)
                this.data[point.categoryId] = [];
            this.data[point.categoryId].push(point);
        };
        HTMLRenderer.prototype.convertYXArrayToPoints = function (yxArray) {
            var data = [];
            for (var y = 0; y < yxArray.length; y++)
                for (var x = 0; x < yxArray[y].length; x++) {
                    data.push({ x: x, y: y, value: yxArray[y][x] });
                }
            return data;
        };
        HTMLRenderer.prototype.convertXYArrayToPoints = function (xyArray) {
            var data = [];
            for (var y = 0; y < xyArray.length; y++)
                for (var x = 0; x < xyArray[y].length; x++) {
                    data.push({ x: x, y: y, value: xyArray[x][y] });
                }
            return data;
        };
        HTMLRenderer.prototype.showLoading = function (targetElementId, show) {
            if (show === void 0) { show = true; }
            var target = $("#" + targetElementId);
            target.toggleClass("emotionmap-loading", show);
        };
        HTMLRenderer.prototype.showRandomData = function () {
            this.clearData(this.getDefaultCategory().id);
            var data = [];
            for (var x = 0; x < this.configuration.emotionMapDimension.x; x++)
                for (var y = 0; y < this.configuration.emotionMapDimension.y; y++)
                    if (Math.random() > 0.5)
                        data.push({ x: x, y: y, value: Math.random(), categoryId: this.getDefaultCategory().id });
            this.addPoints(data);
            this.renderPoints();
            this.triggerConfigurationChangeCallbacks();
        };
        HTMLRenderer.prototype.clearHeatMap = function () {
            this.emotionMapElement.find("td").css("backgroundColor", "");
        };
        HTMLRenderer.prototype.clearHeatMapByTargetElement = function (targetElement) {
            $(targetElement).find("td").css("backgroundColor", "");
        };
        HTMLRenderer.prototype.clearHover = function () {
            this.clearHeatMap();
        };
        HTMLRenderer.prototype.onHover = function (callback) {
            this.onHoverCallbacks.push(callback);
        };
        HTMLRenderer.prototype.triggerOnHover = function (x, y, categoryId, event) {
            if (categoryId === undefined || categoryId === null)
                categoryId = this.getDefaultCategory().id;
            $.each(this.onHoverCallbacks, function (index, fn) {
                fn(x, y, categoryId, event);
            });
            this.clearHover();
            var firstColor = this.getFirstColor(categoryId);
            var secondColor = this.getSecondColor(categoryId);
            this.emotionMapElement.find("td[data-x=\"" + x + "\"][data-y=\"" + y + "\"]").css("backgroundColor", firstColor);
            this.emotionMapElement.find("*[data-x=\"" + (x + 1) + "\"][data-y=\"" + y + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + (x - 1) + "\"][data-y=\"" + y + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + x + "\"][data-y=\"" + (y - 1) + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + x + "\"][data-y=\"" + (y + 1) + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + (x + 1) + "\"][data-y=\"" + (y + 1) + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + (x + 1) + "\"][data-y=\"" + (y - 1) + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + (x - 1) + "\"][data-y=\"" + (y + 1) + "\"]").css("backgroundColor", secondColor);
            this.emotionMapElement.find("*[data-x=\"" + (x - 1) + "\"][data-y=\"" + (y - 1) + "\"]").css("backgroundColor", secondColor);
        };
        HTMLRenderer.prototype.onClick = function (callback) {
            this.onClickCallbacks.push(callback);
        };
        HTMLRenderer.prototype.triggerOnClick = function (x, y, categoryId, rawEvent) {
            this.clearHover();
            if (categoryId === undefined || categoryId === null)
                categoryId = this.getDefaultCategory().id;
            var firstColor = this.getFirstColor(categoryId);
            this.emotionMapElement.find("*[data-x=\"" + x + "\"][data-y=\"" + y + "\"]").css("backgroundColor", firstColor);
            this.configuration.readonly = true;
            this.triggerConfigurationChangeCallbacks();
            $.each(this.onClickCallbacks, function (index, fn) {
                fn(x, y, categoryId, rawEvent);
            });
            if (this.configuration.submitOnClick)
                this.triggerOnSubmit(x, y, categoryId);
        };
        HTMLRenderer.prototype.onSubmit = function (callback) {
            this.onSubmitCallbacks.push(callback);
        };
        HTMLRenderer.prototype.triggerOnSubmit = function (x, y, categoryId) {
            if (categoryId === undefined || categoryId === null)
                categoryId = this.getDefaultCategory().id;
            $.each(this.onSubmitCallbacks, function (index, fn) {
                fn(x, y, categoryId);
            });
            if (this.configuration.afterSubmit) {
                switch (this.configuration.afterSubmit.type) {
                    case "message":
                        this.setText(this.configuration.afterSubmit.data.text, this.configuration.afterSubmit.data.quarter);
                        break;
                    case "heatmap":
                        console.error("which heatmap shall I show...");
                        break;
                }
            }
        };
        HTMLRenderer.prototype.initializeMap = function (targetElementId) {
            var _this = this;
            this.configuration.targetElementId = targetElementId;
            var target = $("#" + targetElementId);
            var html = "<div class=\"emotionmap-container\" id=\"" + targetElementId + "\" style=\"width:" + this.configuration.emotionMapSquareSize * this.configuration.emotionMapDimension.x + "px\"><table class=\"emotionmap-table\">";
            for (var y = 0; y < this.configuration.emotionMapDimension.y; y++) {
                html += "<tr>";
                for (var x = 0; x < this.configuration.emotionMapDimension.x; x++) {
                    var style = "width:" + this.configuration.emotionMapSquareSize + "px;height:" + this.configuration.emotionMapSquareSize + "px;";
                    style += "border:1px " + this.getBorderStyle(this.configuration.gridMode) + " " + this.getRGBAColorString(this.configuration.gridColor) + ";";
                    if (x === ((this.configuration.emotionMapDimension.x - 2) / 2))
                        style += "border-right-color:" + this.getRGBAColorString(this.configuration.gridCrosshairColor) + ";border-right-style:" + this.getBorderStyle(this.configuration.gridCrosshairMode) + ";";
                    if (y === ((this.configuration.emotionMapDimension.y - 2) / 2))
                        style += "border-bottom-color: " + this.getRGBAColorString(this.configuration.gridCrosshairColor) + ";border-bottom-style:" + this.getBorderStyle(this.configuration.gridCrosshairMode) + ";";
                    html += "<td class=\"emotionmap-point\" data-x=\"" + x + "\" data-y=\"" + y + "\" style=\"" + style + "\"></td>";
                }
                html += "</td>";
            }
            html += "</table>";
            html += "<div class=\"emotionmap-label emotionmap-label-top\"></div>";
            html += "<div class=\"emotionmap-label emotionmap-label-bottom\"></div>";
            html += "<div class=\"emotionmap-label emotionmap-label-left\"></div>";
            html += "<div class=\"emotionmap-label emotionmap-label-right\"></div>";
            html += "</div>";
            var emotionmap = $(html);
            emotionmap.on("click", function (event) {
                if (!_this.configuration.readonly) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    _this.triggerOnClick(parseInt(event.target["dataset"]["x"]), parseInt(event.target["dataset"]["y"]), null, event);
                }
            });
            emotionmap.on("mouseover", function (event) {
                if (!_this.configuration.readonly) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    _this.triggerOnHover(parseInt(event.target["dataset"]["x"]), parseInt(event.target["dataset"]["y"]), null, event);
                }
            });
            emotionmap.on("touchend", function (event) {
                if (!_this.configuration.readonly) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    var currentTouchLocation = event["originalEvent"].changedTouches[0];
                    var realTarget = document.elementFromPoint(currentTouchLocation.clientX, currentTouchLocation.clientY);
                    _this.triggerOnClick(parseInt(realTarget["dataset"]["x"]), parseInt(realTarget["dataset"]["y"]), null, event);
                }
            });
            emotionmap.on("touchmove", function (event) {
                if (!_this.configuration.readonly) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    var currentTouchLocation = event["originalEvent"].changedTouches[0];
                    var realTarget = document.elementFromPoint(currentTouchLocation.clientX, currentTouchLocation.clientY);
                    _this.triggerOnHover(parseInt(realTarget["dataset"]["x"]), parseInt(realTarget["dataset"]["y"]), null, event);
                }
            });
            this.emotionMapElement = emotionmap;
            target.fadeOut(function () {
                target.replaceWith(emotionmap);
                _this.renderLabels();
                emotionmap.hide().fadeIn(function () {
                    _this.renderPoints();
                });
            });
        };
        HTMLRenderer.prototype.getBorderStyle = function (style) {
            switch (style) {
                case "dashed":
                    return "dashed";
                case "line":
                    return "solid";
                case "dotted":
                default:
                    return "dotted";
            }
        };
        HTMLRenderer.prototype.renderLabels = function () {
            if (this.configuration && this.configuration.labels && this.emotionMapElement) {
                this.emotionMapElement.find(".emotionmap-label.emotionmap-label-top").text(this.configuration.labels.top);
                this.emotionMapElement.find(".emotionmap-label.emotionmap-label-bottom").text(this.configuration.labels.bottom);
                this.emotionMapElement.find(".emotionmap-label.emotionmap-label-left").text(this.configuration.labels.left);
                this.emotionMapElement.find(".emotionmap-label.emotionmap-label-right").text(this.configuration.labels.right);
            }
        };
        HTMLRenderer.prototype.convertHexToRGB = function (colorAsHex) {
            colorAsHex = colorAsHex.replace('#', '');
            if (colorAsHex.length !== 6 && colorAsHex.length !== 8)
                throw new Error("Please provide hex colors in 6-digit format!");
            var r = parseInt(colorAsHex.substring(0, 2), 16);
            var g = parseInt(colorAsHex.substring(2, 4), 16);
            var b = parseInt(colorAsHex.substring(4, 6), 16);
            return { r: r, g: g, b: b };
        };
        HTMLRenderer.prototype.convertHexToRGBA = function (colorAsHex) {
            var rgb = this.convertHexToRGB(colorAsHex);
            colorAsHex = colorAsHex.replace('#', '');
            var a;
            colorAsHex.length === 8 ? a = parseInt(colorAsHex.substring(6, 8), 16) / 255 : a = 1;
            return $.extend(rgb, { a: a });
        };
        HTMLRenderer.prototype.getColor = function (categoryId, alphaChannel) {
            if (alphaChannel === void 0) { alphaChannel = 1; }
            var category = this.configuration.categories[categoryId];
            if (!category)
                throw new Error("Could not find category '" + categoryId + "'!");
            return this.getRGBAColorString($.extend(category.foregroundColor, { a: alphaChannel }));
        };
        HTMLRenderer.prototype.getRGBAColorString = function (color) {
            return "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
        };
        HTMLRenderer.prototype.getBackgroundColorAsRGBAString = function () {
            return "rgba(" + this.configuration.backgroundColor.r + ", " + this.configuration.backgroundColor.g + ", " + this.configuration.backgroundColor.b + ", " + this.configuration.backgroundColor.a + ")";
        };
        HTMLRenderer.prototype.getFirstColor = function (category) {
            return this.getColor(category, 1);
        };
        HTMLRenderer.prototype.getSecondColor = function (category) {
            return this.getColor(category, 0.2);
        };
        HTMLRenderer.prototype.renderPoints = function () {
            var _this = this;
            this.emotionMapElement.find("td").css("backgroundColor", this.getBackgroundColorAsRGBAString());
            $.each(this.data, function (index, dataSet) {
                for (var i = 0; i < dataSet.length; i++) {
                    _this.emotionMapElement.find("td[data-x=\"" + dataSet[i].x + "\"][data-y=\"" + dataSet[i].y + "\"]").css("backgroundColor", _this.getColor(dataSet[i].categoryId, dataSet[i].value));
                }
            });
        };
        HTMLRenderer.prototype.clearData = function (categoryId) {
            this.data[categoryId] = [];
        };
        HTMLRenderer.prototype.clearAllData = function () {
            this.data = {};
        };
        HTMLRenderer.prototype.createDefaultCategory = function () {
            var category = {
                id: this.defaultCategoryId,
                foregroundColor: { r: 228, g: 40, b: 57 },
                label: this.defaultCategoryName
            };
            this.configuration.categories[this.defaultCategoryId] = category;
            this.data[category.id] = [];
            this.triggerConfigurationChangeCallbacks();
            return category;
        };
        HTMLRenderer.prototype.getDefaultCategory = function () {
            if (this.configuration.categories[this.defaultCategoryId] === undefined)
                return this.createDefaultCategory();
            return this.configuration.categories[this.defaultCategoryId];
        };
        HTMLRenderer.prototype.authorize = function (clientId, tenantId, uri, callback) {
            var SIOPlugin = window["SIOPlugin"];
            SIOPlugin = { 'initialized': false };
            var initialized = false;
            if (SIOPlugin.frame) {
                try {
                    document.body.removeChild(SIOPlugin.frame);
                    SIOPlugin.frame = undefined;
                }
                catch (err) {
                    console.log('[SIO]: WARN: Could not remove SIO auth components', err);
                }
            }
            if (SIOPlugin.authListener) {
                try {
                    window.removeEventListener('message', SIOPlugin.authListener);
                    SIOPlugin.authListener = undefined;
                }
                catch (err) {
                    console.log('[SIO]: WARN: Could not remove SIO auth listener', err);
                }
            }
            SIOPlugin.uri = uri;
            var authUrl = 'https://rest.sensation.io/token?client_id=' + clientId + '&redirect_uri=' + uri + '&tenant=' + tenantId;
            SIOPlugin.createFrame = function () {
                SIOPlugin.frame = document.createElement('iframe');
                var versionPostfix = '';
                SIOPlugin.frame.setAttribute('src', authUrl);
                SIOPlugin.frame.setAttribute('style', 'display:none;');
                document.body.appendChild(SIOPlugin.frame);
                SIOPlugin.frame.onload = function () {
                    SIOPlugin.initialized = true;
                };
            };
            SIOPlugin.createFrame();
            window.addEventListener('message', function (event) {
                var data = event.data;
                if (data && data.length > 0) {
                    var tokenIndex = data.indexOf('sio_token');
                    if (tokenIndex >= 0) {
                        var token = data.substr(tokenIndex + 10, data.length - tokenIndex);
                        callback(undefined, token);
                    }
                }
            }, false);
        };
        return HTMLRenderer;
    }());
    sensationio.HTMLRenderer = HTMLRenderer;
})(sensationio || (sensationio = {}));
