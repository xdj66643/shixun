import os
import cv2
import albumentations as A
from PIL import Image

# 输入输出路径
train_img_dir = "dataset/train/images"
train_label_dir = "dataset/train/labels"
aug_img_dir = "dataset/train/augmented_images"
aug_label_dir = "dataset/train/augmented_labels"
os.makedirs(aug_img_dir, exist_ok=True)
os.makedirs(aug_label_dir, exist_ok=True)

# 定义增强策略
transform = A.Compose([
    A.RandomRotate90(p=0.5),  # 随机旋转90度
    A.HorizontalFlip(p=0.5),  # 水平翻转
    A.RandomBrightnessContrast(p=0.5),  # 亮度/对比度调整
    A.Resize(640, 640)  # 统一尺寸为640x640
], bbox_params=A.BboxParams(format="yolo", label_fields=["class_labels"]))  # 保持YOLO格式的边界框

# 遍历所有图像
for img_name in os.listdir(train_img_dir):
    if not img_name.endswith(".jpg"):
        continue
    img_path = os.path.join(train_img_dir, img_name)
    label_path = os.path.join(train_label_dir, img_name.replace(".jpg", ".txt"))
    if not os.path.exists(label_path):
        continue

    # 读取图像和标签
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    with open(label_path, "r") as f:
        lines = f.readlines()
    bboxes = []
    class_labels = []
    for line in lines:
        cls, xc, yc, w, h = map(float, line.strip().split())
        bboxes.append([xc, yc, w, h])  # YOLO格式：[x_center, y_center, width, height]
        class_labels.append(int(cls))

    # 生成3个增强样本
    for i in range(3):
        try:
            augmented = transform(image=image, bboxes=bboxes, class_labels=class_labels)
            aug_img = augmented["image"]
            aug_bboxes = augmented["bboxes"]
            aug_labels = augmented["class_labels"]

            # 保存增强图像
            aug_img_name = f"{img_name.split('.')[0]}_aug_{i}.jpg"
            aug_img = cv2.cvtColor(aug_img, cv2.COLOR_RGB2BGR)
            cv2.imwrite(os.path.join(aug_img_dir, aug_img_name), aug_img)

            # 保存增强标签
            aug_label_name = aug_img_name.replace(".jpg", ".txt")
            with open(os.path.join(aug_label_dir, aug_label_name), "w") as f:
                for cls, (xc, yc, w, h) in zip(aug_labels, aug_bboxes):
                    f.write(f"{cls} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}\n")
        except:
            continue

print("数据增强完成！")