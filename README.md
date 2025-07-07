# shixun
大家拼命干活吧



大家按照这个步骤配置数据库：

-----

```
1.找到src/main/resources/application.properties

将里面的
spring.datasource.username=root
spring.datasource.password=123456

改成自己在电脑里装的mysql的的账号和密码

2.建好数据库，随便取什么名字都行，但是模式要统一成
smart_road_system

3.在终端写以下sql语句建表
create database smart_road_system;
use smart_road_system;

/* 一、用户与认证系统模块*/
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100),
    mail VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    face_id VARCHAR(100), -- 人脸数据标识（如文件名或人脸编码）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE verification_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    target_type ENUM('EMAIL', 'PHONE') NOT NULL,
    target_value VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expired_at DATETIME NOT NULL,                /*验证码过期时间*/
    verified BOOLEAN DEFAULT FALSE,              /*表示验证码是否已被使用验证成功*/
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP/*创建时间，记录发送时间*/
);

CREATE TABLE text_captchas (                      /*文字验证码*/
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    captcha_id VARCHAR(50) NOT NULL,
    correct_sequence TEXT NOT NULL,               /*用户需要点击的文字顺序*/
    expired_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE face_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    image_path VARCHAR(200),
    recognized BOOLEAN,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('INFO', 'WARN', 'ERROR'),
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/*二、路面病害检测模块*/
CREATE TABLE detection_videos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_path VARCHAR(200) NOT NULL,
    upload_user BIGINT,
    processed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_user) REFERENCES users(id)
);

-- 病害识别记录表
CREATE TABLE road_defects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id BIGINT NOT NULL,
    defect_type ENUM('裂缝-纵向', '裂缝-横向', '龟裂', '坑洼') NOT NULL,
    position VARCHAR(100),
    area FLOAT,
    confidence FLOAT,
    image_path VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES detection_videos(id)
);

/* 三、城市交通分析模块*/
-- 车辆轨迹点表
CREATE TABLE vehicle_trajectories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    longitude DOUBLE NOT NULL,
    latitude DOUBLE NOT NULL,
    speed FLOAT,
    direction FLOAT
);

-- 区域小时级交通统计表
CREATE TABLE traffic_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    region_name VARCHAR(100) NOT NULL,
    hour INT NOT NULL,
    vehicle_count INT DEFAULT 0,
    avg_speed FLOAT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 上客热点区域表
CREATE TABLE passenger_hotzones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    region_name VARCHAR(100) NOT NULL,
    longitude DOUBLE NOT NULL,
    latitude DOUBLE NOT NULL,
    pickup_count INT DEFAULT 0,
    date DATE NOT NULL
);


```
