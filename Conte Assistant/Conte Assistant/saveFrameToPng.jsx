// 函数：创建UI面板
function createUI(thisObj) {
    var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "保存当前帧", undefined);
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];
    panel.spacing = 10;
    panel.margins = 16;

    var selectFolderButton = panel.add("button", undefined, "选择保存路径");
    var saveButton = panel.add("button", undefined, "保存当前帧");

    var outputPath = null;

    selectFolderButton.onClick = function() {
        outputPath = Folder.selectDialog("选择输出文件夹");
        if (outputPath) {
            alert("已选择保存路径: " + outputPath.fsName);
        } else {
            alert("未选择输出文件夹");
        }
    };

    saveButton.onClick = function() {
        if (outputPath) {
            saveFrameToPng(outputPath);
        } else {
            alert("请先选择输出文件夹");
        }
    };

    // 显示UI面板
    if (panel instanceof Window) {
        panel.show();
    } else {
        panel.layout.layout(true);
    }
}

// 函数：格式化日期为YYMMDDHHmm
function formatDate(date) {
    var year = String(date.getFullYear());
    var month = String(dataLeftCompleting(date.getMonth() + 1,2));
    var day = String(dataLeftCompleting(date.getDate(),2));
    var hour = String(dataLeftCompleting(date.getHours(),2));
    var minute = String(dataLeftCompleting(date.getMinutes(),2));
    var second = String(dataLeftCompleting(date.getSeconds(),2));
    return year + month + day + '_' + hour + minute + second;
}

function dataLeftCompleting(originData, bits) {
    identifier = "0";
    originData = Array(bits + 1).join(identifier) + originData;
    return originData.slice(-bits);
}

// 函数：保存当前帧为PNG
function saveFrameToPng(outputPath) {
    var activeItem = app.project.activeItem;
    if (!activeItem || !(activeItem instanceof CompItem)) {
        alert("没有活动的合成");
        return;
    }

    // 获取当前时间
    var currentTime = formatDate(new Date());

    // 获取当前帧
    var currentFrame = Math.round(activeItem.time * activeItem.frameRate);

    // 设置输出文件名
    var outputFileName = outputPath.fsName + "/frame" + currentFrame + "_" + currentTime + ".png";

    // 保存PNG
    try {
        activeItem.saveFrameToPng(currentFrame, new File(outputFileName));
        // 显示保存结果
        alert("已保存到: " + outputFileName);
    } catch (e) {
        alert("保存失败，错误信息: " + e.toString());
    }
}

// 创建并显示UI
createUI(this);