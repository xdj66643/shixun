import os
import xml.etree.ElementTree as ET
import shutil

# 源数据路径（根据实际解压路径修改）
source_img_dir = "RDD2022_all_countries/United_States/train/images"  # 可替换为其他国家文件夹
source_anno_dir = "RDD2022_all_countries/United_States/train/annotations/xmls"
# 目标路径
target_train_img = "dataset/train/images"
target_train_label = "dataset/train/labels"
target_val_img = "dataset/val/images"
target_val_label = "dataset/val/labels"

# 创建目标文件夹
for dir in [target_train_img, target_train_label, target_val_img, target_val_label]:
    os.makedirs(dir, exist_ok=True)

# 标签映射：目标病害→类别ID（0-3对应4类病害）
label_map = {
    "D00": 0,  # 纵向裂缝
    "D01": 0,
    "D10": 1,  # 横向裂缝
    "D11": 1,
    "D20": 2,  # 龟裂
    "D40": 3   # 坑洼（假设D40中仅保留坑洼，需后续处理）
}

# 遍历所有XML标签
all_xmls = [f for f in os.listdir(source_anno_dir) if f.endswith(".xml")]
for i, xml_name in enumerate(all_xmls):
    xml_path = os.path.join(source_anno_dir, xml_name)
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # 获取图像路径
    img_name = root.find("filename").text
    img_path = os.path.join(source_img_dir, img_name)
    if not os.path.exists(img_path):
        continue

    # 解析标签中的病害类型
    labels = []
    for obj in root.iter("object"):
        cls = obj.find("name").text
        if cls in label_map:
            # 提取边界框坐标
            bndbox = obj.find("bndbox")
            xmin = float(bndbox.find("xmin").text)
            ymin = float(bndbox.find("ymin").text)
            xmax = float(bndbox.find("xmax").text)
            ymax = float(bndbox.find("ymax").text)
            # 转换为YOLO格式（归一化）
            img_width = float(root.find("size").find("width").text)
            img_height = float(root.find("size").find("height").text)
            x_center = (xmin + xmax) / 2 / img_width
            y_center = (ymin + ymax) / 2 / img_height
            width = (xmax - xmin) / img_width
            height = (ymax - ymin) / img_height
            labels.append(f"{label_map[cls]} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")

    # 仅保留有目标标签的样本
    if labels:
        # 划分训练集（80%）和验证集（20%）
        if i % 5 == 0:  # 每5个样本取1个作为验证集
            save_img_dir = target_val_img
            save_label_dir = target_val_label
        else:
            save_img_dir = target_train_img
            save_label_dir = target_train_label

        # 复制图像到目标文件夹
        shutil.copy(img_path, os.path.join(save_img_dir, img_name))
        # 保存YOLO格式标签
        txt_name = img_name.replace(".jpg", ".txt")
        with open(os.path.join(save_label_dir, txt_name), "w") as f:
            f.write("\n".join(labels))

print("数据筛选完成！")