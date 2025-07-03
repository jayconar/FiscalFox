package com.fiscalfox.backend.controller;

import com.fiscalfox.backend.dto.LoginRequest;
import com.fiscalfox.backend.dto.LoginResponse;
import com.fiscalfox.backend.dto.SignupRequest;
import com.fiscalfox.backend.entity.User;
import com.fiscalfox.backend.repository.UserRepository;
import com.fiscalfox.backend.security.JwtUtils;
import com.fiscalfox.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userDetails.getUser();
        
        return ResponseEntity.ok(new LoginResponse(
            jwt, 
            user.getId(),
            user.getUsername(), 
            user.getEmail()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        Map<String, String> errors = new HashMap<>();
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                errors.put("username", "Username is already taken!");
        }
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                errors.put("email", "Email is already in use!");
        }
        
        if (!errors.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(errors);
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}