var f = File("~/Desktop/1.png");
f.encoding = 'BINARY';
f.open('e');
var binary;
binary = f.read().toSource();

var myFile = new File("~/Desktop/pngBin.txt");
myFile.open("w");
myFile.encoding = "BINARY";
myFile.write(binary);
myFile.close();
f.close();