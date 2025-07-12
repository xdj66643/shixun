import cv2
from ultralytics import YOLO

# 加载模型
model = YOLO("road_damage/exp13/weights/best.pt")

# 检测图像
image_path = "crack.jpg"  # 替换为你的测试图像路径
results = model(image_path, conf=0.2)  # conf=0.2表示置信度阈值

# 保存检测结果
for r in results:
    im_array = r.plot()  # 绘制检测框和标签
    im = cv2.cvtColor(im_array, cv2.COLOR_BGR2RGB)
    cv2.imwrite("result.jpg", im_array)  # 保存结果图像

print("检测完成，结果保存在result.jpg")