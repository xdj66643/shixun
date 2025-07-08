# test_haar_cascade.py
import cv2
import os

# 获取脚本所在目录
base_dir = os.path.dirname(os.path.abspath(__file__))
cascade_path = os.path.join(base_dir, "data", "haarcascade_frontalface_default.xml")

print(f"🔍 查找文件: {cascade_path}")

if not os.path.exists(cascade_path):
    print("❌ 文件不存在！")
    print("请从以下链接下载并保存到data目录:")
    print("https://github.com/opencv/opencv/raw/master/data/haarcascades/haarcascade_frontalface_default.xml")
else:
    print("✅ 文件存在")
    
    # 尝试加载分类器
    try:
        face_cascade = cv2.CascadeClassifier(cascade_path)
        if face_cascade.empty():
            print("❌ 分类器加载失败（文件可能损坏）")
        else:
            print("✅ 分类器加载成功")
            
            # 测试人脸检测（需要一张测试图片）
            test_img_path = os.path.join(base_dir, "test.jpg")
            if os.path.exists(test_img_path):
                img = cv2.imread(test_img_path)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                print(f"✅ 检测到 {len(faces)} 个人脸")
            else:
                print("⚠️ 测试图片不存在，跳过检测")
    except Exception as e:
        print(f"❌ 加载出错: {str(e)}")