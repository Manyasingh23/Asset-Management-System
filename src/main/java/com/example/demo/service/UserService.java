package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public Optional<User> login(String username, String password) {

        Optional<User> user =
                userRepository.findByUsername(username);

        if (user.isPresent() &&
                passwordEncoder.matches(
                        password,
                        user.get().getPassword())) {

            return user;
        }

        return Optional.empty();
    }
    public User createEmployeeAccount(String email, String password) {
    User user = new User();
    user.setUsername(email);
    user.setPassword(passwordEncoder.encode(password));
    user.setRole("EMPLOYEE");

    return userRepository.save(user);
}
}