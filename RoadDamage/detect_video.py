import cv2
import winsound
from ultralytics import YOLO
import numpy as np
import json
import sys
import collections.abc
import os

print("detect_video.py 已启动")
print("sys.argv:", sys.argv)

# 加载模型
model_path = os.path.join(os.path.dirname(__file__), "road_damage/exp13/weights/best.pt")
model = YOLO(model_path)
print("模型类别：", model.names)

# 视频路径
video_path = sys.argv[1] if len(sys.argv) > 1 else "try222.mp4"
print("视频路径：", video_path)
video_basename = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(video_path)
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print("视频无法打开")
    sys.exit(1)

# 视频输出设置
fourcc = cv2.VideoWriter_fourcc(*"mp4v") # type: ignore
out = cv2.VideoWriter("output.mp4", fourcc, 25, (int(cap.get(3)), int(cap.get(4))))

# 病害计数（记录已检测到的物体ID，避免重复计数）
disease_counts = [0, 0, 0, 0]  # 4类病害的实际数量
alert_threshold = 3
tracked_ids = set()  # 存储已计数的物体ID（去重）
defect_results = []  # 新增：用于存储检测结果

# 中文字体支持函数
def put_chinese_text(img, text, position, font_scale, color, thickness):
    from PIL import Image, ImageDraw, ImageFont
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    font_size = int(font_scale * 40)
    try:
        font = ImageFont.truetype("simhei.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()
    draw.text(position, text, font=font, fill=tuple(reversed(color)))
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

frame_count = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1
    print(f"处理第{frame_count}帧")

    # 关键修改：使用track模式（而非detect），开启目标跟踪
    # persist=True：保持跟踪ID的连续性（同一物体在连续帧中ID不变）
    results = model.track(frame, conf=0.1, persist=True)
    detections = results[0].boxes

    # 重置当前帧计数（仅用于告警，不影响总计数）
    current_counts = [0, 0, 0, 0]

    # 绘制检测结果并去重计数
    if (
        detections is not None
        and getattr(detections, 'id', None) is not None
        and hasattr(detections, '__len__')
        and hasattr(detections.id, '__len__')
        and detections.id is not None
    ):
        print(f"检测到{len(detections.id)}个目标")
        for i in range(len(detections.id)):
            box = detections[i]
            track_id = detections.id[i]
            cls = int(box.cls[0])
            cls_name = model.names[cls]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            track_id = int(track_id)  # 物体唯一跟踪ID

            # 绘制边界框和标签（显示跟踪ID）
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
            label = f"{cls_name} (ID:{track_id}) {conf:.2f}"
            frame = put_chinese_text(frame, label, (x1, max(y1-30, 10)), 0.8, (0, 255, 0), 2)

            # 去重计数：仅当ID是新出现的（未记录过），才累加总计数
            if track_id not in tracked_ids:
                tracked_ids.add(track_id)  # 记录ID，避免重复
                disease_counts[cls] += 1  # 累加实际数量

            # 当前帧计数（用于告警）
            current_counts[cls] += 1

            # 新增：收集检测结果
            defect_results.append({
                "defect_type": cls_name,
                "position": f"{x1},{y1},{x2},{y2}",
                "area": (x2-x1)*(y2-y1),
                "confidence": conf,
                "image_path": f"defect_{track_id}.jpg",
                "video_path": video_basename
            })
            # 可选：保存截图
            # cv2.imwrite(f"defect_{track_id}.jpg", frame[y1:y2, x1:x2])
    else:
        print("本帧未检测到目标")

    # 告警判断（基于当前帧数量）
    total_current = sum(current_counts)
    if total_current >= alert_threshold:
        winsound.Beep(1000, 500)
        frame = put_chinese_text(frame, "ALERT: 病害密集！", (50, 70), 1.2, (0, 0, 255), 3)

    # 保存输出视频
    out.write(frame)
    cv2.imshow("Road Damage Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

print(f"总共处理帧数: {frame_count}")

# 释放资源
cap.release()
out.release()
cv2.destroyAllWindows()

# 打印去重后的实际计数结果
print("病害检测实际数量统计：")
for i, name in enumerate(model.names):
    print(f"{name}：{disease_counts[i]}处")

# 检测结束后保存为 JSON 文件
result_json = sys.argv[3] if len(sys.argv) > 3 else "result.json"
# 写到 backend/ 目录
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
if not os.path.exists(backend_dir):
    os.makedirs(backend_dir)
result_json_path = os.path.join(backend_dir, result_json)
print("即将写入json文件：", result_json_path)
with open(result_json_path, "w", encoding="utf-8") as f:
    json.dump(defect_results, f, ensure_ascii=False, indent=2)
print("json文件写入完成")

with open("argv.log", "a", encoding="utf-8") as f:
    f.write(str(sys.argv) + "\n")