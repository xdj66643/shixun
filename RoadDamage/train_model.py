from ultralytics import YOLO
import torch
print("是否使用GPU:", torch.cuda.is_available())  # 应输出False
print("当前设备:", "GPU" if torch.cuda.is_available() else "CPU")  # 应输出CPU

# 加载模型（确保yolov8n.pt已在项目目录）
model = YOLO("yolov8n.pt")

# 训练模型（删除所有device相关参数）
results = model.train(
    data='dataset.yaml',  # 确保此文件路径正确
    epochs=30,
    imgsz=640,
    batch=4,  # CPU训练时建议减小batch（如4或2，避免内存不足）
    workers=0,  # CPU训练时workers设为0，避免多线程问题
    project='road_damage',
    name='yolov8n_road_damage'
)