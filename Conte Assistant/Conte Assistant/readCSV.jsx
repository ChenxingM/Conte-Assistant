// 导入必要的类
var File = $.global.File;

// 函数：从CSV文件读取数据到数组
function readCSVData(CSVFile) {
    var CSVData = [];
    if (CSVFile !== null) {
        CSVFile.open("r");

        while (!CSVFile.eof) {
            var currentLine = CSVFile.readln();
            CSVData.push(currentLine.split(","));
        }

        CSVFile.close();
    }
    return CSVData;
}

// 函数：创建UI面板
function createUI(thisObj) {
    var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "CSV数据", undefined);
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];
    panel.spacing = 10;
    panel.margins = 16;

    var loadButton = panel.add("button", undefined, "加载CSV文件");
    var textarea = panel.add("edittext", undefined, "", {multiline: true, readonly: true});
    textarea.preferredSize = [400, 300];

    loadButton.onClick = function() {
        // 选择要读取的CSV文件
        var CSVFile = File.openDialog("请选择一个CSV文件");
        var CSVData = readCSVData(CSVFile);
        if (CSVData.length > 0) {
            // 将CSV数据添加到文本区域
            var text = "";
            for (var i = 0; i < CSVData.length; i++) {
                text += CSVData[i].join("\t") + "\n";
            }
            textarea.text = text;
        } else {
            $.writeln("未选择文件或文件为空");
        }
    };

    // 显示UI面板
    if (panel instanceof Window) {
        panel.show();
    } else {
        panel.layout.layout(true);
    }
}

// 创建并显示UI
createUI(this);
