<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
# import requests
>>>>>>> Stashed changes
=======
# import requests
>>>>>>> Stashed changes
import os
import cv2
import numpy as np
import pickle
import hashlib
from datetime import datetime
from cryptography.fernet import Fernet
from threading import Thread
import smtplib
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart

class FaceRecognitionSystem:
    def __init__(self, data_dir="face_data", encrypted_dir="encrypted_data", 
                 log_dir="security_logs", key_file="encryption_key.key"):
        # 目录初始化
        self.data_dir = data_dir
        self.encrypted_dir = encrypted_dir
        self.log_dir = log_dir
        self.key_file = key_file
        
        for dir_path in [data_dir, encrypted_dir, log_dir]:
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)
        
        # 加密设置
        if not os.path.exists(key_file):
            self.generate_encryption_key()
        self.cipher_suite = Fernet(self.load_encryption_key())
        
        # 加载Haar级联分类器（手动指定路径）
        cascade_path = os.path.join(os.path.dirname(__file__), "data", "haarcascade_frontalface_default.xml")
        if not os.path.exists(cascade_path):
            print(f"错误: 请从GitHub下载haarcascade_frontalface_default.xml并保存到 {os.path.dirname(cascade_path)}")
            self.face_cascade = None
        else:
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            print("Haar级联分类器加载成功")
        
        # 初始化人脸识别器
        try:
            self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        except AttributeError:
            print("错误: 无法初始化人脸识别器，请确保安装了opencv-contrib-python")
            self.recognizer = None
        
        # 用户数据
        self.user_dict = {}  # 用户ID到用户名的映射
        self.user_dict_file = os.path.join(data_dir, "user_dict.pkl")
        self.load_user_dict()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        
=======
        # # 后端接口配置
        # self.api_base_url = "http://localhost:8080"  # 根据你的Spring Boot部署地址修改

>>>>>>> Stashed changes
=======
        # # 后端接口配置
        # self.api_base_url = "http://localhost:8080"  # 根据你的Spring Boot部署地址修改

>>>>>>> Stashed changes
        # 告警设置（示例邮箱配置，需替换为实际信息）
        self.alert_email = "your_email@example.com"
        self.smtp_server = "smtp.example.com"
        self.smtp_port = 587
        self.smtp_username = "your_email@example.com"
        self.smtp_password = "your_password"

    def generate_encryption_key(self):
        """生成AES加密密钥并保存到文件"""
        key = Fernet.generate_key()
        with open(self.key_file, 'wb') as f:
            f.write(key)
        print(f"加密密钥已生成并保存到 {self.key_file}")

    def load_encryption_key(self):
        """从文件加载加密密钥"""
        with open(self.key_file, 'rb') as f:
            return f.read()

    def encrypt_data(self, data):
        """使用AES加密数据"""
        return self.cipher_suite.encrypt(data)

    def decrypt_data(self, encrypted_data):
        """使用AES解密数据"""
        return self.cipher_suite.decrypt(encrypted_data)

    def load_user_dict(self):
        """加载用户字典"""
        if os.path.exists(self.user_dict_file):
            with open(self.user_dict_file, 'rb') as f:
                self.user_dict = pickle.load(f)
            print(f"已加载用户字典，包含 {len(self.user_dict)} 个用户")

    def save_user_dict(self):
        """保存用户字典"""
        with open(self.user_dict_file, 'wb') as f:
            pickle.dump(self.user_dict, f)

    def capture_face_samples(self, username):
        """采集用户面部样本并保存"""
        if self.face_cascade is None:
            print("错误: 人脸检测器未初始化")
            return
            
        user_id = len(self.user_dict) + 1
        self.user_dict[user_id] = username
        self.save_user_dict()
        
        user_dir = os.path.join(self.data_dir, f"user_{user_id}")
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
        
        cap = cv2.VideoCapture(0)
        sample_count = 0
        
        print(f"开始为用户 {username} (ID: {user_id}) 采集面部样本")
        print("请面对摄像头，缓慢转动头部...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("无法获取图像")
                break
                
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
            
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                sample_count += 1
                
                # 保存面部样本
                face_roi = gray[y:y+h, x:x+w]
                img_path = os.path.join(user_dir, f"face_{sample_count}.png")
                cv2.imwrite(img_path, face_roi)
                
                cv2.putText(frame, f"样本数: {sample_count}", (x, y-10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
            
            cv2.imshow('采集面部样本', frame)
            
            # 按ESC或采集100个样本后退出
            if cv2.waitKey(1) == 27 or sample_count >= 100:
                break
        
        cap.release()
        cv2.destroyAllWindows()
        print(f"已成功采集 {sample_count} 个面部样本")
        
        # 加密保存样本目录
        self.encrypt_directory(user_dir)
        print(f"用户 {username} 的面部数据已加密保存")

    def encrypt_directory(self, dir_path):
        """加密目录中的所有文件"""
        for filename in os.listdir(dir_path):
            file_path = os.path.join(dir_path, filename)
            if os.path.isfile(file_path):
                with open(file_path, 'rb') as f:
                    data = f.read()
                encrypted_data = self.encrypt_data(data)
                
                encrypted_file_path = os.path.join(self.encrypted_dir, 
                                                  f"{os.path.basename(dir_path)}_{filename}.enc")
                with open(encrypted_file_path, 'wb') as f:
                    f.write(encrypted_data)
    
    def decrypt_directory(self, encrypted_dir_path, target_dir):
        """解密目录中的所有文件"""
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        
        for filename in os.listdir(encrypted_dir_path):
            if filename.endswith('.enc') and filename.startswith(f"user_"):
                encrypted_file_path = os.path.join(encrypted_dir_path, filename)
                with open(encrypted_file_path, 'rb') as f:
                    encrypted_data = f.read()
                decrypted_data = self.decrypt_data(encrypted_data)
                
                # 提取原始文件名
                original_filename = filename.split('_', 1)[1].rsplit('.', 1)[0]
                user_id = int(filename.split('_')[1])
                
                user_target_dir = os.path.join(target_dir, f"user_{user_id}")
                if not os.path.exists(user_target_dir):
                    os.makedirs(user_target_dir)
                    
                decrypted_file_path = os.path.join(user_target_dir, original_filename)
                with open(decrypted_file_path, 'wb') as f:
                    f.write(decrypted_data)
                    
        return target_dir

    def train_model(self):
        """训练人脸识别模型"""
        if self.recognizer is None:
            print("无法训练模型: 人脸识别器未初始化")
            return
            
        print("开始训练人脸识别模型...")
        
        # 创建临时目录用于解密数据
        temp_dir = os.path.join(self.data_dir, "temp_train")
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, file)
                if os.path.isdir(file_path):
                    for f in os.listdir(file_path):
                        os.remove(os.path.join(file_path, f))
                    os.rmdir(file_path)
                else:
                    os.remove(file_path)
        else:
            os.makedirs(temp_dir)
        
        # 解密所有加密数据
        decrypted_dir = self.decrypt_directory(self.encrypted_dir, temp_dir)
        
        faces = []
        labels = []
        
        # 遍历所有用户目录
        for user_id in self.user_dict.keys():
            user_dir = os.path.join(decrypted_dir, f"user_{user_id}")
            if os.path.exists(user_dir):
                for filename in os.listdir(user_dir):
                    if filename.endswith(".png"):
                        img_path = os.path.join(user_dir, filename)
                        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                        faces.append(img)
                        labels.append(user_id)
        
        # 训练模型
        if faces and labels:
            self.recognizer.train(faces, np.array(labels))
            model_path = os.path.join(self.data_dir, "face_model.yml")
            self.recognizer.save(model_path)
            print(f"模型训练完成并保存到 {model_path}")
        else:
            print("没有找到训练数据")
            
        # 清理临时文件
        for file in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, file)
            if os.path.isdir(file_path):
                for f in os.listdir(file_path):
                    os.remove(os.path.join(file_path, f))
                os.rmdir(file_path)
            else:
                os.remove(file_path)
        os.rmdir(temp_dir)

    def recognize_face(self, confidence_threshold=100):
        """实时人脸识别"""
        if self.recognizer is None or self.face_cascade is None:
            print("无法进行人脸识别: 组件未初始化")
            return
            
        model_path = os.path.join(self.data_dir, "face_model.yml")
        if not os.path.exists(model_path):
            print("模型文件不存在，请先训练模型")
            return
        
        self.recognizer.read(model_path)
        
        cap = cv2.VideoCapture(0)
        
        print("开始人脸识别...")
        print("按ESC键退出")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("无法获取图像")
                break
                
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
            
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                
                # 预测人脸
                user_id, confidence = self.recognizer.predict(face_roi)
                
                # 绘制识别结果
                if confidence < confidence_threshold:
                    username = self.user_dict.get(user_id, "未知用户")
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    cv2.putText(frame, f"{username} ({confidence:.2f})", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
                    # # 登录接口调用
                    # try:
                    #     login_payload = {
                    #             "face_id": f"user_{user_id}"
                    #             }
                    #     response = requests.post(f"{self.api_base_url}/api/auth/face-login", json=login_payload)
                    #     if response.status_code == 200:
                    #         print(f"用户 {username} 登录成功")
                    #     else:
                    #         print(f"用户 {username} 登录失败: {response.status_code} - {response.text}")
                    # except Exception as e:
                    #     print(f"登录接口调用失败: {str(e)}")

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                else:
                    # 非认证用户
                    username = "未知用户"
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                    cv2.putText(frame, f"{username} ({confidence:.2f})", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    
                    # 记录非认证用户并告警
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    alert_img_path = os.path.join(self.log_dir, f"alert_{timestamp}.jpg")
                    cv2.imwrite(alert_img_path, frame)
                    
                    # 异步发送告警
                    Thread(target=self.send_alert, args=(alert_img_path, username)).start()
            
            cv2.imshow('人脸识别系统', frame)
            
            # 按ESC键退出
            if cv2.waitKey(1) == 27:
                break
        
        cap.release()
        cv2.destroyAllWindows()

    def send_alert(self, image_path, username):
        """发送安全告警"""
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            msg = MIMEMultipart()
            msg['Subject'] = f"安全告警：检测到非认证用户 {timestamp}"
            msg['From'] = self.alert_email
            msg['To'] = self.alert_email
            
            body = f"""
            <html>
                <body>
                    <h3>安全告警</h3>
                    <p>时间: {timestamp}</p>
                    <p>检测到非认证用户: {username}</p>
                    <p>图像记录如下:</p>
                    <img src="cid:image1" width="400" />
                </body>
            </html>
            """
            
            msg.attach(MIMEImage(open(image_path, 'rb').read(), _subtype="jpeg", 
                                filename=os.path.basename(image_path), 
                                _id="image1"))
            
            # 发送邮件
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            print(f"已发送告警邮件至 {self.alert_email}")
        except Exception as e:
            print(f"发送告警邮件失败: {str(e)}")

    def detect_deepfake(self, image_path):
        """检测深度伪造（示例框架，需扩展）"""
        # 这里只是一个示例框架，实际需要集成专门的深度伪造检测模型
        # 可以使用如FaceForensics++等开源模型
        print(f"检测深度伪造: {image_path}")
        print("注意: 此功能需要额外的模型支持，当前为示例实现")
        
        # 模拟检测结果
        is_deepfake = False  # 实际中应该基于模型预测
        confidence = 0.0     # 伪造置信度
        
        return is_deepfake, confidence

# 使用示例
if __name__ == "__main__":
    # 创建data目录并下载Haar级联文件
    if not os.path.exists("data"):
        os.makedirs("data")
        print("请从以下链接下载haarcascade_frontalface_default.xml:")
        print("https://github.com/opencv/opencv/blob/4.x/data/haarcascades_cuda/haarcascade_frontalface_default.xml")
        print("并保存到项目目录下的data文件夹中")
    
    # 初始化系统
    fr_system = FaceRecognitionSystem()
    
    while True:
        print("\n=== 人脸识别系统菜单 ===")
        print("1. 录入新用户")
        print("2. 训练模型")
        print("3. 开始人脸识别")
        print("4. 退出")
        
        choice = input("请选择操作: ")
        
        if choice == "1":
            username = input("请输入用户名: ")
            fr_system.capture_face_samples(username)
            
        elif choice == "2":
            fr_system.train_model()
            
        elif choice == "3":
            fr_system.recognize_face()
            
        elif choice == "4":
            print("退出系统")
            break
            
        else:
            print("无效选择，请重试")