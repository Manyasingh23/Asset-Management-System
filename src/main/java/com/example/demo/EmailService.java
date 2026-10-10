package com.example.demo;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Asset Management System - Email Verification");
        message.setText(
            "Your OTP for email verification is: " + otp
            + "\n\nThis OTP is for testing your account registration."
        );

        mailSender.send(message);
    }
}