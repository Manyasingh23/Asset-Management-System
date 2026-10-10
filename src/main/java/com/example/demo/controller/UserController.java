
package com.example.demo.controller;

import com.example.demo.EmailService;
import com.example.demo.entity.User;
import com.example.demo.service.JwtService;
import com.example.demo.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final Map<String, String> otpStore =
            new ConcurrentHashMap<>();

    public UserController(
            UserService userService,
            JwtService jwtService,
            EmailService emailService) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    // Create user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        var loggedInUser = userService.login(
                user.getUsername(),
                user.getPassword()
        );

        if (loggedInUser.isPresent()) {
            User foundUser = loggedInUser.get();

            String token = jwtService.generateToken(
                    foundUser.getUsername(),
                    foundUser.getRole()
            );

            return ResponseEntity.ok(token);
        }

        return ResponseEntity
                .status(401)
                .body("Invalid username or password");
    }

    // Request OTP
    @PostMapping("/signup/request-otp")
    public ResponseEntity<?> requestOtp(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null ||
                !email.toLowerCase().endsWith("@company.com")) {
            return ResponseEntity.badRequest()
                    .body("Please use your official @company.com email.");
        }

        String normalizedEmail = email.toLowerCase();

        String otp = String.format(
                "%06d",
                new SecureRandom().nextInt(1_000_000)
        );

        otpStore.put(normalizedEmail, otp);

        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP sent successfully.");
        } catch (Exception e) {
            otpStore.remove(normalizedEmail);
            return ResponseEntity.internalServerError()
                    .body("Could not send OTP. Please try again.");
        }
    }

    // Verify OTP and create employee account
    @PostMapping("/signup/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");
        String password = request.get("password");

        if (email == null || otp == null || password == null) {
            return ResponseEntity.badRequest()
                    .body("Email, OTP and password are required.");
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 8 characters.");
        }

        String normalizedEmail = email.toLowerCase();
        String storedOtp = otpStore.get(normalizedEmail);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            return ResponseEntity.badRequest()
                    .body("Invalid OTP. Please request a new OTP.");
        }

        User newUser =
                userService.createEmployeeAccount(email, password);

        otpStore.remove(normalizedEmail);

        return ResponseEntity.ok(
                "Employee account created successfully."
        );
    }
}

