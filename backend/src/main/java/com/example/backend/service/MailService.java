package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("2869390299@qq.com");
        message.setTo(toEmail);
        message.setSubject("登录验证码");
        message.setText("您的验证码是：" + code + "，5分钟内有效。请勿泄露。");
        javaMailSender.send(message);
    }
}

