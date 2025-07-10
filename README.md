# 2025软件工程暑期实训
（readme version1）

大家拼命干活吧



（readme version2）

大家按照这个步骤配置数据库：https://pcnr6b5ddex1.feishu.cn/file/BeGJbaLHmoBBbkxv6h8cyRvinHf

项目名修改：shixun->smart_road_system


（readme version3）

运行方法：（不包括配置）

#### 第一步：在xxxxxx\smart_road_system\Facerecognition目录下运行

​               **python faces.py**（独立的人脸识别服务（Flask））

​                监听来自后端（Spring Boot）的请求

​                根据指示操作即可，录入人脸并训练模型后，即可按5（退出），但不用关闭命令行（或powershell、anaconda prompt）



#### 第二步：启动后端

​                其中有几个配置需要根据个人情况修改：

​                在**application.properties**中：

数据库的配置：

```
spring.datasource.username=实际的用户名（一般都是root）
spring.datasource.password=实际的密码
```

想自己测试的可以用自己的邮箱和授权码（**SMTP**）

```
spring.mail.username=xxxxxxx@qq.com
spring.mail.password=xxxxxxx
```



#### 第三步：运行前端

##### 注册模块：

如果用户名（或手机、邮箱）重复，则注册失败，

只有三者都不重复，才能注册成功



##### 登录模块：

账号密码登录：没什么好说的

邮箱验证码登录：由自己测试的邮箱xxxxxxx@qq.com发出邮件，自己注册的邮箱用来接收

人脸识别登录：如果前面已经成功录入人脸并训练模型，点击开始识别的按钮后，识别成功就会进入主页面

###### 

现在main分支到了这个阶段，主页面只是摆设，还没什么用









```

```
